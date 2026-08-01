#!/usr/bin/env python3
"""
US Visa (India) appointment monitor.

Logs in to the US visa scheduling portal, checks the appointment calendar on a
fixed interval, and sends a push notification to your phone the moment a slot
opens within a date range you choose. It does NOT book anything automatically —
see the README for why that is a deliberate choice.

Run:  python checker.py
Config comes from environment variables (see config.example.env / README.md).
"""

from __future__ import annotations

import os
import sys
import json
import time
import random
import logging
import datetime as dt
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import requests

# Playwright is imported lazily inside the fetcher so the notification/config
# code can be unit-tested without a browser installed.


# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

def _get(name: str, default: Optional[str] = None, required: bool = False) -> str:
    val = os.environ.get(name, default)
    if required and not val:
        sys.exit(f"[config] Missing required environment variable: {name}")
    return val if val is not None else ""


@dataclass
class Config:
    # --- Portal credentials -------------------------------------------------
    email: str = field(default_factory=lambda: _get("VISA_EMAIL", required=True))
    password: str = field(default_factory=lambda: _get("VISA_PASSWORD", required=True))
    # Login page for the India US-visa scheduling portal. Verify against the live
    # site; the portal has migrated vendors before (ustraveldocs -> usvisascheduling).
    login_url: str = field(default_factory=lambda: _get(
        "VISA_LOGIN_URL", "https://www.usvisascheduling.com/en-US/"))
    # The consular post / city you want to watch (e.g. "NEW DELHI", "MUMBAI",
    # "CHENNAI", "HYDERABAD", "KOLKATA"). Must match the label used on the site.
    location: str = field(default_factory=lambda: _get("VISA_LOCATION", "NEW DELHI"))

    # --- Date range you care about -----------------------------------------
    date_from: dt.date = field(default_factory=lambda: _parse_date("VISA_DATE_FROM", required=True))
    date_to: dt.date = field(default_factory=lambda: _parse_date("VISA_DATE_TO", required=True))

    # --- Timing -------------------------------------------------------------
    interval_seconds: int = field(default_factory=lambda: int(_get("VISA_INTERVAL_SECONDS", "600")))
    jitter_seconds: int = field(default_factory=lambda: int(_get("VISA_JITTER_SECONDS", "90")))
    headless: bool = field(default_factory=lambda: _get("VISA_HEADLESS", "true").lower() != "false")

    # --- Push notifications -------------------------------------------------
    # ntfy: dead simple, no account. Pick an unguessable topic and subscribe on
    # your phone with the ntfy app. https://ntfy.sh
    ntfy_topic: str = field(default_factory=lambda: _get("NTFY_TOPIC", ""))
    ntfy_server: str = field(default_factory=lambda: _get("NTFY_SERVER", "https://ntfy.sh"))
    # Pushover: alternative, needs an account + app token.
    pushover_token: str = field(default_factory=lambda: _get("PUSHOVER_TOKEN", ""))
    pushover_user: str = field(default_factory=lambda: _get("PUSHOVER_USER", ""))

    # --- State --------------------------------------------------------------
    state_file: Path = field(default_factory=lambda: Path(
        _get("VISA_STATE_FILE", str(Path(__file__).parent / ".state.json"))))

    def validate(self) -> None:
        if self.date_to < self.date_from:
            sys.exit("[config] VISA_DATE_TO must be on or after VISA_DATE_FROM")
        if not (self.ntfy_topic or (self.pushover_token and self.pushover_user)):
            sys.exit("[config] Configure a notifier: set NTFY_TOPIC, or "
                     "PUSHOVER_TOKEN + PUSHOVER_USER.")


def _parse_date(env_name: str, required: bool = False) -> dt.date:
    raw = _get(env_name, required=required)
    if not raw:
        # Only reached when required=False and unset.
        return dt.date.max
    try:
        return dt.date.fromisoformat(raw.strip())
    except ValueError:
        sys.exit(f"[config] {env_name} must be YYYY-MM-DD (got: {raw!r})")


# --------------------------------------------------------------------------- #
# Notifications
# --------------------------------------------------------------------------- #

class Notifier:
    def __init__(self, cfg: Config):
        self.cfg = cfg

    def send(self, title: str, message: str, url: Optional[str] = None,
             priority: str = "high") -> None:
        sent = False
        if self.cfg.ntfy_topic:
            sent |= self._ntfy(title, message, url, priority)
        if self.cfg.pushover_token and self.cfg.pushover_user:
            sent |= self._pushover(title, message, url, priority)
        if not sent:
            logging.warning("No notifier delivered the message.")

    def _ntfy(self, title, message, url, priority) -> bool:
        headers = {
            "Title": title.encode("utf-8"),
            "Priority": "5" if priority == "high" else "3",
            "Tags": "calendar,us,visa",
        }
        if url:
            # Makes the notification tappable straight to the booking page.
            headers["Actions"] = f"view, Open booking page, {url}, clear=true"
        try:
            r = requests.post(
                f"{self.cfg.ntfy_server.rstrip('/')}/{self.cfg.ntfy_topic}",
                data=message.encode("utf-8"), headers=headers, timeout=15)
            r.raise_for_status()
            return True
        except requests.RequestException as e:
            logging.error("ntfy send failed: %s", e)
            return False

    def _pushover(self, title, message, url, priority) -> bool:
        data = {
            "token": self.cfg.pushover_token,
            "user": self.cfg.pushover_user,
            "title": title,
            "message": message,
            "priority": 1 if priority == "high" else 0,
        }
        if url:
            data["url"] = url
            data["url_title"] = "Open booking page"
        try:
            r = requests.post("https://api.pushover.net/1/messages.json",
                              data=data, timeout=15)
            r.raise_for_status()
            return True
        except requests.RequestException as e:
            logging.error("Pushover send failed: %s", e)
            return False


# --------------------------------------------------------------------------- #
# State (so we only notify on *new* openings, not every 10 minutes)
# --------------------------------------------------------------------------- #

def load_state(path: Path) -> dict:
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_state(path: Path, state: dict) -> None:
    try:
        path.write_text(json.dumps(state, indent=2))
    except OSError as e:
        logging.warning("Could not persist state: %s", e)


# --------------------------------------------------------------------------- #
# Site adapter — the ONLY portal-specific code.
# --------------------------------------------------------------------------- #
#
# This is the piece most likely to need adjustment: the scheduling portal is
# behind a login, is JavaScript/Salesforce-heavy, and periodically changes its
# HTML and (sometimes) its vendor. The function must:
#
#   1. log in with cfg.email / cfg.password,
#   2. navigate to the "reschedule / schedule appointment" calendar for
#      cfg.location, and
#   3. return every AVAILABLE appointment date it can see, as datetime.date.
#
# The selectors below are placeholders that reflect the general shape of the
# portal. Run once with VISA_HEADLESS=false, watch what the browser does, and
# tweak the marked selectors to match the live page. If a CAPTCHA appears, log
# in by hand in the visible window — the script waits for the calendar and then
# takes over the polling.
# --------------------------------------------------------------------------- #

class LoginError(RuntimeError):
    pass


def fetch_available_dates(cfg: Config) -> list[dt.date]:
    from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

    found: list[dt.date] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=cfg.headless)
        context = browser.new_context(
            locale="en-US",
            user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/125.0 Safari/537.36"),
        )
        page = context.new_page()
        try:
            page.goto(cfg.login_url, wait_until="domcontentloaded", timeout=60_000)

            # --- 1. LOG IN -------------------------------------------------- #
            # >>> VERIFY THESE SELECTORS against the live login form. <<<
            try:
                page.fill("input[type='email'], #username", cfg.email, timeout=20_000)
                page.fill("input[type='password'], #password", cfg.password)
                page.click("button[type='submit'], input[type='submit']")
            except PWTimeout:
                # Login form not found automatically — likely a CAPTCHA or a
                # changed layout. In headful mode, give the human time to finish.
                if cfg.headless:
                    raise LoginError(
                        "Login form not found. Re-run with VISA_HEADLESS=false "
                        "and complete any CAPTCHA by hand.")
                logging.warning("Auto-login failed; waiting for manual login...")

            # Wait until we're past the login (calendar/dashboard visible).
            # >>> VERIFY: a selector that only exists once logged in. <<<
            page.wait_for_selector(
                "text=/schedule|reschedule|appointment/i", timeout=120_000)

            # --- 2. OPEN THE APPOINTMENT CALENDAR FOR cfg.location ---------- #
            # >>> VERIFY / adjust this navigation to match the portal. <<<
            # Typical flow: "Schedule Appointment" -> "Reschedule" -> pick city.
            for label in ("Reschedule Appointment", "Schedule Appointment",
                          "Continue"):
                link = page.get_by_text(label, exact=False)
                if link.count():
                    link.first.click()
                    page.wait_for_load_state("networkidle", timeout=60_000)
                    break

            # Select the consular post if a dropdown is present.
            try:
                page.get_by_role("combobox").first.select_option(label=cfg.location)
                page.wait_for_load_state("networkidle", timeout=30_000)
            except Exception:
                pass  # Some layouts don't need an explicit city select.

            # --- 3. READ AVAILABLE DATES FROM THE CALENDAR ----------------- #
            # >>> VERIFY: how the calendar marks a bookable day. Portals commonly
            # render available days as clickable cells and unavailable ones as
            # disabled. Adjust the selector to match. <<<
            page.wait_for_selector(".ui-datepicker, [data-appointment-date], "
                                   "table.calendar", timeout=60_000)
            cells = page.query_selector_all(
                "[data-appointment-date]:not(.disabled), "
                ".ui-datepicker-calendar td:not(.ui-datepicker-unselectable) a")
            for c in cells:
                iso = c.get_attribute("data-appointment-date")
                if iso:
                    parsed = _safe_iso(iso)
                    if parsed:
                        found.append(parsed)
                        continue
                # Fallback: a bare day number inside the currently shown month.
                # (Reading month/year from the calendar header is portal-specific;
                # prefer the data-appointment-date attribute above when present.)
        except PWTimeout as e:
            raise LoginError(f"Timed out reaching the calendar: {e}") from e
        finally:
            context.close()
            browser.close()

    # De-dup and sort.
    return sorted(set(found))


def _safe_iso(raw: str) -> Optional[dt.date]:
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y", "%d %B %Y", "%d %b %Y"):
        try:
            return dt.datetime.strptime(raw.strip(), fmt).date()
        except ValueError:
            continue
    return None


# --------------------------------------------------------------------------- #
# Main loop
# --------------------------------------------------------------------------- #

def in_range(d: dt.date, cfg: Config) -> bool:
    return cfg.date_from <= d <= cfg.date_to


def run_once(cfg: Config, notifier: Notifier, state: dict) -> None:
    dates = fetch_available_dates(cfg)
    matches = [d for d in dates if in_range(d, cfg)]
    logging.info("Checked %s: %d available date(s), %d in your range [%s .. %s].",
                 cfg.location, len(dates), len(matches),
                 cfg.date_from, cfg.date_to)

    matched_iso = sorted(d.isoformat() for d in matches)
    already = set(state.get("notified", []))
    fresh = [d for d in matched_iso if d not in already]

    if fresh:
        earliest = fresh[0]
        title = f"US visa slot open @ {cfg.location}"
        body = ("Available in your range: " + ", ".join(fresh) +
                f"\nEarliest: {earliest}\nBook now — slots vanish fast.")
        notifier.send(title, body, url=cfg.login_url, priority="high")
        logging.info("Notified about new date(s): %s", fresh)

    # Remember only dates still available, so a slot that reappears later
    # notifies again.
    state["notified"] = matched_iso
    state["last_check"] = dt.datetime.now().isoformat(timespec="seconds")


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S")

    # Optional: load a local .env if python-dotenv is installed.
    try:
        from dotenv import load_dotenv
        load_dotenv(Path(__file__).parent / ".env")
    except ImportError:
        pass

    cfg = Config()
    cfg.validate()
    notifier = Notifier(cfg)
    state = load_state(cfg.state_file)

    logging.info("Monitoring %s for US visa slots in [%s .. %s] every ~%ds.",
                 cfg.location, cfg.date_from, cfg.date_to, cfg.interval_seconds)
    notifier.send("Visa monitor started",
                  f"Watching {cfg.location} for {cfg.date_from}..{cfg.date_to}.",
                  priority="low")

    consecutive_errors = 0
    while True:
        try:
            run_once(cfg, notifier, state)
            save_state(cfg.state_file, state)
            consecutive_errors = 0
        except KeyboardInterrupt:
            logging.info("Stopped by user.")
            break
        except LoginError as e:
            consecutive_errors += 1
            logging.error("Login/navigation problem: %s", e)
        except Exception as e:  # noqa: BLE001 - keep the loop alive
            consecutive_errors += 1
            logging.exception("Check failed: %s", e)

        # Back off on repeated failures so we don't hammer the portal.
        base = cfg.interval_seconds * (2 ** min(consecutive_errors, 4)
                                       if consecutive_errors else 1)
        sleep_for = base + random.randint(0, cfg.jitter_seconds)
        if consecutive_errors >= 5:
            notifier.send("Visa monitor needs attention",
                          f"{consecutive_errors} checks in a row failed. "
                          "The portal layout or your login may need attention.",
                          priority="high")
        logging.info("Next check in ~%d min.", round(sleep_for / 60))
        try:
            time.sleep(sleep_for)
        except KeyboardInterrupt:
            logging.info("Stopped by user.")
            break


if __name__ == "__main__":
    main()

# US Visa (India) Appointment Monitor

Checks the US visa scheduling portal for India every ~10 minutes and sends a
**push notification to your phone** the moment an appointment opens within a
date range you choose. You then book it yourself.

## Why it alerts instead of auto-booking

This tool deliberately does **not** book for you.

- The India portal (now **usvisascheduling.com**, a login-protected,
  JavaScript/Salesforce-based site) uses CAPTCHAs and bot detection.
- Official guidance is explicit: accounts flagged for **automated booking tools**
  can have their **appointments cancelled** and may have to re-pay the visa fee.
- You can only reschedule once (2025 rule) before paying again — you do not want
  a flaky script burning that on the wrong slot.

Getting a reliable push the second a slot appears — and tapping through to book
in the same minute — gets you the appointment without risking your application.
If you still want auto-booking later, the single hook is `run_once()` in
`checker.py`: it already has the matched dates in hand.

## Setup

```bash
cd us-visa-appointment-checker
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium        # one-time browser download

cp config.example.env .env
# edit .env with your login, city, date range, and notifier
```

### Phone notifications (ntfy — no account, easiest)

1. Install the **ntfy** app (iOS / Android).
2. Pick a long, unguessable topic name and set it as `NTFY_TOPIC` in `.env`
   (anyone who knows the topic can read your alerts, so make it random).
3. In the app, **Subscribe** to that same topic.
4. Alerts arrive as tappable notifications with a link straight to the portal.

Prefer **Pushover**? Set `PUSHOVER_TOKEN` and `PUSHOVER_USER` instead.

## Run

```bash
# First run: watch it log in and clear any CAPTCHA by hand.
VISA_HEADLESS=false python checker.py

# Once login works, run it unattended:
python checker.py
```

Leave it running on an always-on machine (home server, a small VM, a Raspberry
Pi). To run it as a background service, see **Running 24/7** below.

## The one piece you'll likely need to adjust

`fetch_available_dates()` in `checker.py` is the only portal-specific code, and
it's fully commented. Because the site is behind a login I can't see and changes
its HTML periodically, the CSS selectors in that function are best-effort
placeholders marked with `>>> VERIFY <<<`. To tune them:

1. Run with `VISA_HEADLESS=false` and watch the browser.
2. When it reaches the calendar, right-click an **available** day → Inspect.
3. Update the selectors (login fields, the "Reschedule" navigation, and the
   available-day cell selector) to match what you see.

Everything else — interval, jitter, date-range filtering, de-duping so you're
only pinged on *new* openings, back-off on errors, and notifications — works as
is.

## Configuration reference

| Variable | Meaning | Default |
|---|---|---|
| `VISA_EMAIL` / `VISA_PASSWORD` | Portal login | *(required)* |
| `VISA_LOGIN_URL` | Portal login page | usvisascheduling.com |
| `VISA_LOCATION` | Consular post to watch | `NEW DELHI` |
| `VISA_DATE_FROM` / `VISA_DATE_TO` | Accepted range (YYYY-MM-DD) | *(required)* |
| `VISA_INTERVAL_SECONDS` | Base gap between checks | `600` (10 min) |
| `VISA_JITTER_SECONDS` | Random extra delay | `90` |
| `VISA_HEADLESS` | Hide the browser | `true` |
| `NTFY_TOPIC` / `NTFY_SERVER` | ntfy push | — |
| `PUSHOVER_TOKEN` / `PUSHOVER_USER` | Pushover push | — |

## Running 24/7 (systemd example)

```ini
# /etc/systemd/system/visa-monitor.service
[Unit]
Description=US visa appointment monitor
After=network-online.target

[Service]
WorkingDirectory=/path/to/us-visa-appointment-checker
ExecStart=/path/to/us-visa-appointment-checker/.venv/bin/python checker.py
EnvironmentFile=/path/to/us-visa-appointment-checker/.env
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now visa-monitor
journalctl -u visa-monitor -f      # watch the logs
```

## Please be a good citizen

- The 10-minute interval + jitter is intentionally gentle. Don't crank it down;
  aggressive polling is exactly what gets accounts flagged.
- Keep `.env` private — it holds your password. It's git-ignored here.
- This is an unofficial personal tool, not affiliated with the US government or
  the portal operator. Use it in line with the portal's terms.

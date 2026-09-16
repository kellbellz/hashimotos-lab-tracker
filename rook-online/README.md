# Rook Online

A 4-player online Rook table (Express + Socket.IO backend, plain HTML/CSS/JS
client, no build step). Create a room, share the 4-letter code with three
friends, and play a full partnership game of Rook in the browser.

## Running it

```bash
cd rook-online
npm install
npm start
```

Then open `http://localhost:3000` (or `$PORT` if set) in four browser
tabs/devices. One player creates the room and shares the code; the other
three join with it. The host starts the game once all 4 seats are filled
("Add CPU" can fill empty seats with a simple bot for solo testing).

Game state lives in memory in the Node process - restarting the server
clears all rooms. That's fine for a casual game night; if you want games to
survive restarts/deploys you'd need to add persistence, which isn't included.

## Deploying so remote friends can join

This needs a long-running Node process with WebSocket support - static
hosts like GitHub Pages won't work. The repo includes a Render Blueprint
(`render.yaml` at the repo root) for a one-click deploy:

1. Click **[Deploy to Render](https://render.com/deploy?repo=https://github.com/kellbellz/hashimotos-lab-tracker)**.
2. Sign in / create a free Render account if you don't have one, review the
   detected `rook-online` web service, and click **Apply**.
3. Wait for the build to finish (a minute or two), then open the URL Render
   gives the service and share it with your 3 friends.

Render's free tier spins the service down after ~15 minutes of no traffic,
so the first person to open the link after a quiet spell will see a
30-60 second cold start before the page loads - normal, not broken.

Any other small Node host works too (Railway, Fly.io, a VM): point its
start command at `npm start` inside `rook-online/` and make sure `PORT` is
respected (it already is, via `process.env.PORT`).

## Rules implemented

Standard Rook (56 cards numbered 1-14 in four colors, plus the Rook bird
card; 13 cards dealt to each of 4 players in fixed partnerships - seats 0&2
vs. seats 1&3 - with a 5-card kitty/nest), with a **Newman rules** preset
selectable at room creation that overrides these four things per the
handwritten rules sheet:

| | Newman | Standard |
|---|---|---|
| Minimum bid | 5 | 70 |
| Rook card point value | 25 | 20 |
| First trick | led by the winning bidder | led by the player to the dealer's left |
| Points in discard pile (aka nest) | not added to either team's point total | added to the final-trick winner |
| Rook card play | ranks as the **lowest** trump card and must follow normal follow-suit rules like any other trump | ranks as the **highest** trump card and may be played at any time, even if you could follow suit |

Everything else (bidding in increments of 5, a player forced to bid if
everyone else passes before anyone bids, point cards 1=15/5=5/10=10/14=10,
dealer rotating each hand, teams scoring what they capture while the bidding
team scores their bid negatively if they don't make it, playing to 300
points) follows standard Rook.

### Assumptions worth double-checking

The 4-color deck ranking (14 high down to 1 low within a color) and the
300-point target score were not specified in the notes and are the common
Rook defaults - both are easy to change in `gameEngine.js` (`RULESETS` /
`Room.targetScore`) if your group plays differently.

## Project layout

```
rook-online/
  server/
    gameEngine.js   deck, ranking, legal plays, trick winner, scoring - pure logic
    room.js         one room's live state machine (bidding/nest/play) + simple bot AI
    index.js        Express static file server + Socket.IO event wiring
  public/
    index.html, style.css, client.js   the whole browser client, no build step
```

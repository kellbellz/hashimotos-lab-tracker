# Process Redraw

Describe a process out loud or in writing. The tool maps it as it works today, grouped by who does each step, then redesigns it and marks every step as AI, human, or physical work.

## How it runs

| Where | Microphone | Claude |
|---|---|---|
| Your own website (Cloudflare Pages) | Works in Chrome, Edge, Safari | Through `functions/api/claude.js`, which holds your API key on the server |
| claude.ai artifact | Blocked by claude.ai; use the keyboard's dictation key | The viewer's own Claude account |
| Opened as a local file | Depends on the browser | Not available; maps are rough one-step-per-sentence drafts |

Your API key never reaches the browser. Buyers' browsers call `/api/claude` on your site, and only that function talks to Anthropic.

## Deploy on Cloudflare Pages (free hosting)

1. Create an API key at console.anthropic.com. Set a monthly spend limit there so a spike can't surprise you.
2. In the Cloudflare dashboard, open **Workers & Pages → Create → Pages → Connect to Git** and choose this repository.
3. Build settings:
   - Production branch: the branch you want live
   - Root directory: `tools/process-redraw`
   - Build command: `npm install && npm run build`
   - Build output directory: `dist`
4. Under **Settings → Environment variables**, add:
   - `ANTHROPIC_API_KEY` (encrypt it; this is the secret)
   - `ACCESS_CODES` — comma-separated codes that unlock Claude, e.g. one per customer or one per plan. Leave it out and anyone with the link spends your API credit.
   - `MODEL` (optional) — defaults to `claude-opus-5`. Set `claude-sonnet-5` or `claude-haiku-4-5` to lower cost per use.
5. Deploy. Every push to the production branch redeploys.

## Costs to plan for

- Hosting: Cloudflare Pages' free plan covers the static site and a daily allowance of function requests. Check their current limits before launch.
- Claude API: the real per-customer cost. Each added line runs one small call, and each redesign runs one larger call. Watch usage in the Anthropic console for your first customers, then price the product with margin.

## Selling it

`ACCESS_CODES` is a simple gate to launch with. Once you pick a store (Gumroad, Lemon Squeezy, Stripe), the next step is having the function check license keys with the store's API instead of a fixed list. That way you can revoke refunds, and each code can have its own usage limit.

## Files

- `index.html` — the whole app. It's written as a claude.ai artifact body, so it has no `<!doctype>`.
- `build.mjs` — wraps `index.html` into a full page at `dist/index.html`.
- `functions/api/claude.js` — the server function that calls Claude.

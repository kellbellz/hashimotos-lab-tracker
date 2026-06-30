# React + Vite

## 🏡 Home Affordability & Repair Reality Check

A self-contained tool that (1) estimates what house you can afford from income
and savings, (2) splits that into upfront vs. monthly spending power, and (3)
stress-tests it against a fixer-upper's repair list with offer recommendations.

### Use it from a URL

**Instant (no setup)** - the tool is a single self-contained file, so a raw-HTML
viewer can serve it straight from this branch:

https://htmlpreview.github.io/?https://raw.githubusercontent.com/kellbellz/hashimotos-lab-tracker/claude/home-affordability-repair-calc-ggqjqe/public/home-affordability.html

**Permanent (one-time setup)** - GitHub Pages gives a clean, fast URL:

https://kellbellz.github.io/hashimotos-lab-tracker/home-affordability.html

Enable it once: repo **Settings → Pages → Build and deployment → Source: GitHub
Actions**. After that, the workflow in `.github/workflows/deploy.yml` builds and
publishes on every push automatically (until Pages is enabled the workflow's
`configure-pages` step will fail - that is expected).

**Local** - served at `/home-affordability.html` when you run `npm run dev`, or
just open `public/home-affordability.html` directly in any browser.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

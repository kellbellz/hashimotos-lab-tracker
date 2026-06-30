# React + Vite

## 🏡 Home Affordability & Repair Reality Check

A self-contained tool that (1) estimates what house you can afford from income
and savings, (2) splits that into upfront vs. monthly spending power, and (3)
stress-tests it against a fixer-upper's repair list with offer recommendations.

**Live URL:** https://kellbellz.github.io/hashimotos-lab-tracker/home-affordability.html

The page is published automatically by the GitHub Pages workflow
(`.github/workflows/deploy.yml`) on every push. One-time setup: in the repo's
**Settings → Pages**, set **Source** to **GitHub Actions** (the workflow also
attempts to enable this automatically). Locally it's served at
`/home-affordability.html` when you run `npm run dev`, or just open
`public/home-affordability.html` in a browser.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

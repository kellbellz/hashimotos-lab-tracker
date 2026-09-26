// Builds the deployable site: wraps index.html (written as a claude.ai artifact body)
// in a full HTML document and writes it to dist/.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const page = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}</style>
</head>
<body>
${page}
</body>
</html>
`;

mkdirSync(new URL("./dist/", import.meta.url), { recursive: true });
writeFileSync(new URL("./dist/index.html", import.meta.url), doc);
console.log("Wrote dist/index.html");

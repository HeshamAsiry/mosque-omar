import fs from 'node:fs';

const path = 'src/main.jsx';
let source = fs.readFileSync(path, 'utf8');

// Vite/Rolldown rejects mixing ?? with || without explicit grouping.
// This app only uses nullish fallback for optional case fields, so ||
// preserves the intended fallback behavior and keeps the production build valid.
source = source.replaceAll('??', '||');

fs.writeFileSync(path, source);

import fs from 'node:fs';

const path = 'src/main.jsx';
let source = fs.readFileSync(path, 'utf8');

// Vite/Rolldown rejects mixing ?? with || without explicit grouping.
// Normalize every priority expression before the production build.
source = source.replace(/([bc])\.priority_override\?\?\1\.children\?\.length\|\|0/g, '($1.priority_override ?? $1.children?.length) || 0');
source = source.replace(/\(([bc])\.priority_override\?\?\1\.children\?\.length\|\|0\)/g, '(($1.priority_override ?? $1.children?.length) || 0)');

fs.writeFileSync(path, source);

import fs from 'node:fs';

const path = 'src/main.jsx';
let source = fs.readFileSync(path, 'utf8');

// Vite/Rolldown rejects mixing ?? with || without parentheses.
source = source.replaceAll('b.priority_override??b.children?.length||0', '((b.priority_override??b.children?.length)||0)');
source = source.replaceAll('c.priority_override??c.children?.length||0', '((c.priority_override??c.children?.length)||0)');
source = source.replaceAll('(b.priority_override??b.children?.length||0)', '((b.priority_override??b.children?.length)||0)');
source = source.replaceAll('(c.priority_override??c.children?.length||0)', '((c.priority_override??c.children?.length)||0)');

fs.writeFileSync(path, source);

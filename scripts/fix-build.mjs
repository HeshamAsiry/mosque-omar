import fs from 'node:fs';

const path = 'src/main.jsx';
let source = fs.readFileSync(path, 'utf8');

// Vite/Rolldown rejects mixing ?? with || without parentheses.
// These are only used for the waiting-list priority fallback, where || is equivalent for our values.
source = source.replaceAll('b.priority_override??b.children?.length||0', '((b.priority_override||b.children?.length)||0)');
source = source.replaceAll('c.priority_override??c.children?.length||0', '((c.priority_override||c.children?.length)||0)');
source = source.replaceAll('b.priority_override??b.children?.length', '(b.priority_override||b.children?.length)');
source = source.replaceAll('c.priority_override??c.children?.length', '(c.priority_override||c.children?.length)');

fs.writeFileSync(path, source);

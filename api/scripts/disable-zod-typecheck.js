// scripts/disable-zod-check.js
const fs = require('node:fs');
const path = require('node:path');

const target = path.join(__dirname, '..', 'prisma', 'generated', 'zod', 'index.ts');

try {
  let content = fs.readFileSync(target, 'utf8');
  let updated = false;

  if (!content.startsWith('// @ts-nocheck')) {
    content = '// @ts-nocheck\n' + content;
    updated = true;
    console.log('Prepended // @ts-nocheck to', target);
  } else {
    console.log('// @ts-nocheck already present');
  }

  if (updated) {
    fs.writeFileSync(target, content, 'utf8');
  }
} catch (err) {
  console.error('Could not update file:', target, err.message);
  process.exit(1);
}

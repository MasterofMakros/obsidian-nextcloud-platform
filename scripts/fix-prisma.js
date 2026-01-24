const fs = require('fs');
const path = require('path');

const pnpmDir = path.resolve(__dirname, '../node_modules/.pnpm');

if (!fs.existsSync(pnpmDir)) {
    console.log('No .pnpm folder found in node_modules');
    process.exit(0);
}

const entries = fs.readdirSync(pnpmDir);
let fixedCount = 0;

entries.forEach(entry => {
    if (entry.startsWith('@prisma+client')) {
        const defaultJsPath = path.join(pnpmDir, entry, 'node_modules/.prisma/client/default.js');
        if (fs.existsSync(defaultJsPath)) {
            try {
                let content = fs.readFileSync(defaultJsPath, 'utf8');
                if (content.includes("require('#main-entry-point')")) {
                    console.log(`Fixing ${defaultJsPath}`);
                    content = content.replace("require('#main-entry-point')", "require('./index.js')");
                    fs.writeFileSync(defaultJsPath, content);
                    fixedCount++;
                } else {
                    console.log(`Already fixed: ${entry}`);
                }
            } catch (err) {
                console.error(`Error fixing ${entry}:`, err.message);
            }
        }
    }
});

console.log(`Fixed ${fixedCount} Prisma Client instances.`);

const fs = require('fs');
const path = require('path');

const tokens = require('./tokens.json');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Copy JSON for reference
fs.copyFileSync(path.join(__dirname, 'tokens.json'), path.join(distDir, 'tokens.json'));

// Flatten function to create CSS vars
function flattenTokens(obj, prefix = '--') {
    let css = '';
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            css += flattenTokens(obj[key], `${prefix}${key}-`);
        } else {
            // Handle known weird keys like "DEFAULT" if any, but our tokens are clean.
            // e.g. --color-background-primary: #1e1e1e;
            css += `  ${prefix}${key}: ${obj[key]};\n`;
        }
    }
    return css;
}

const cssVariables = `:root {\n${flattenTokens(tokens)}}\n`;

fs.writeFileSync(path.join(distDir, 'variables.css'), cssVariables);
console.log('Design tokens built: dist/variables.css');

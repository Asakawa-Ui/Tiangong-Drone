const fs = require('fs');
const path = './src/components/WorkspaceLeft.css';
let content = fs.readFileSync(path, 'utf8');

const oldStyles = `  background: rgba(223, 227, 232, 0.45);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.04), inset 0 1px 3px rgba(0, 0, 0, 0.02);`;

const newStyles = `  background: rgba(230, 235, 240, 0.35);
  border: 1px solid rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.02), inset 0 1px 2px rgba(0, 0, 0, 0.01);`;

content = content.split(oldStyles).join(newStyles);
fs.writeFileSync(path, content, 'utf8');
console.log('Done');

const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory && f === 'node_modules') return;
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let modifiedCount = 0;

walkDir('C:/Users/ajayy/Desktop/THE-LEGACY-TRUNK---935/backend', (filePath) => {
  if (filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace \` with `
    content = content.replace(/\\`/g, '`');
    // Replace \$ with $
    content = content.replace(/\\\$/g, '$');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log('Fixed escaping in:', filePath);
    }
  }
});

console.log('Total backend files fixed:', modifiedCount);

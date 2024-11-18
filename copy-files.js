const fs = require('fs');
const path = require('path');

const files = [
    'texture-pie-18701720.webp',
    'Pie_Goblin_1110143250.fbx',
];
for (const file of files) {
    const srcFile = path.join(__dirname, file);
    const destFile = path.join(__dirname, 'dist', file);
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${srcFile} to ${destFile}`);
}


import fs from 'fs';

const file = fs.readFileSync('server.ts', 'utf8');
const lines = file.split('\n');

let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (hashVal > 85) {')) {
    startIndex = i;
    break;
  }
}

if (startIndex !== -1) {
  const replacement = fs.readFileSync('good_tail.txt', 'utf8');
  lines.splice(startIndex);
  lines.push(replacement);

  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log('Fixed block structurally from', startIndex);
} else {
  console.log('Could not find start index');
}

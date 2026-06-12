const fs = require('fs');
let file = fs.readFileSync('src/components/CloudStrategyPanel.tsx', 'utf8');
file = file.replace(/className=\{\\`flex-1/g, 'className={`flex-1');
file = file.replace(/hover:text-\\[#C9D1D9\\]"\\}\\`\\}/g, 'hover:text-[#C9D1D9]"}`}');
file = file.replace(/\\$\\{mode/g, '${mode');
fs.writeFileSync('src/components/CloudStrategyPanel.tsx', file);

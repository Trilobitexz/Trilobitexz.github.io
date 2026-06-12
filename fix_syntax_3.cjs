const fs = require('fs');
let file = fs.readFileSync('src/components/CloudStrategyPanel.tsx', 'utf8');

file = file.replace(/className=\{`flex-1 py-2 text-sm font-semibold rounded-md transition-all \\\$\{mode === "auto" \? "bg-\[#21262D\] text-\[#E6EDF3\] shadow-sm" : "text-\[#8B949E\] hover:text-\[#C9D1D9\]"\}\\\`\}/g,
  'className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === "auto" ? "bg-[#21262D] text-[#E6EDF3] shadow-sm" : "text-[#8B949E] hover:text-[#C9D1D9]"}`}');

file = file.replace(/className=\{`flex-1 py-2 text-sm font-semibold rounded-md transition-all \\\$\{mode === "manual" \? "bg-\[#21262D\] text-\[#E6EDF3\] shadow-sm" : "text-\[#8B949E\] hover:text-\[#C9D1D9\]"\}\\\`\}/g,
  'className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === "manual" ? "bg-[#21262D] text-[#E6EDF3] shadow-sm" : "text-[#8B949E] hover:text-[#C9D1D9]"}`}');

fs.writeFileSync('src/components/CloudStrategyPanel.tsx', file);

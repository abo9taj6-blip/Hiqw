const fs = require('fs');

function fix(path) {
  let code = fs.readFileSync(path, 'utf8');

  // 1. DashboardCard compact text styling
  code = code.replace(
    /font-display font-black text-\[11px\] tracking-tight text-white\/95 truncate/g,
    `font-display font-black text-[9.5px] leading-tight tracking-tight text-white/95 text-wrap`
  );

  code = code.replace(
    /className=\{\`w-full bg-gradient-to-br \$\{gradient\} p-2 rounded-xl text-white flex flex-row items-center justify-center gap-1\.5 shadow-sm hover:shadow-md active:scale-95 transition-all text-center border border-white\/10 min-h-\[38px\]\`\}/g,
    `className={\`w-full bg-gradient-to-br \${gradient} p-1.5 rounded-xl text-white flex flex-col items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all text-center border border-white/10 min-h-[44px]\`}`
  );

  fs.writeFileSync(path, code, 'utf8');
}

['src/App.tsx', 'admin_panel/src/App.tsx'].forEach(p => fs.existsSync(p) && fix(p));
console.log('App DashboardCard updated');

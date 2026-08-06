const fs = require('fs');

function fixStoreDetailPage(path) {
  let code = fs.readFileSync(path, 'utf8');
  
  if (code.includes('className="fixed inset-0 z-[120] bg-[#FAFAFA]')) {
    code = code.replace(
      /<div className="fixed inset-0 z-\[120\] bg-\[\#FAFAFA\] overflow-y-auto text-\[\#1E293B\] pb-28 font-sans" dir="rtl">/g,
      `<motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 z-[3000] bg-[#FAFAFA] overflow-y-auto text-[#1E293B] pb-28 font-sans shadow-2xl" dir="rtl">`
    );
    // Replace closing div
    code = code.replace(
      /<\/div>\n\s*$/m,
      `</motion.div>\n`
    );
  }
  
  fs.writeFileSync(path, code, 'utf8');
}

['src/components/market/StoreDetailPage.tsx', 'admin_panel/src/components/market/StoreDetailPage.tsx'].forEach(p => fs.existsSync(p) && fixStoreDetailPage(p));
console.log('StoreDetailPage updated');

const fs = require('fs');

function fix(path) {
  let code = fs.readFileSync(path, 'utf8');

  // We need to add showSearch state
  if (!code.includes('const [showSearch, setShowSearch]')) {
    code = code.replace(
      /const \[search, setSearch\] = useState\(''\);/,
      "const [search, setSearch] = useState('');\n  const [showSearch, setShowSearch] = useState(false);"
    );
  }

  // Remove the large search bar
  code = code.replace(
    /\{\/\* Search \*\/\}\s*<div className="relative mb-4">\s*<input\s*type="text"\s*placeholder="البحث في الدليل\.\.\."\s*value=\{search\}\s*onChange=\{e => setSearch\(e\.target\.value\)\}\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2\.5 pr-10 pl-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500\/20 focus:border-orange-500 shadow-inner"\s*\/>\s*<Search className="absolute right-3 top-1\/2 -translate-y-1\/2 text-slate-400" size=\{14\} \/>\s*\{search && <button onClick=\{\(\) => setSearch\(''\)\} className="absolute left-3 top-1\/2 -translate-y-1\/2 text-slate-400" ><X size=\{14\} \/><\/button>\}\s*<\/div>/,
    ``
  );

  // Instead add it under tabs next to grid/list toggle
  // Replace the Subheader controlbar
  const subBarOriginal = `{/* ── Subheader controlbar & Grid/List toggler ── */}
        <div className="flex items-center justify-between mb-3 px-1.5">
          <div className="text-right">
            <h3 className="text-xs font-black text-slate-800">
              {marketTab === 'offers' ? 'أحدث العروض الحصرية النشطة' :
               marketTab === 'restaurants' ? 'جميع المطاعم وجلسات الطعام المعتمدة' :
               marketTab === 'gyms' ? 'قاعات كمال الأجسام والفيتنس' :
               'جميع المعارض المعتمدة'}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {marketTab === 'offers' ? 'عروض وتخفيضات خاصة' :
               marketTab === 'restaurants' ? 'اطلب الان بكل سهولة' :
               marketTab === 'gyms' ? 'سجل معنا الأن' :
               'سيارات جديدة ومستعملة'}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewType('grid')}
              className={\`p-1.5 rounded-md transition-all \${viewType === 'grid' ? 'bg-white shadow-xs text-orange-500' : 'text-slate-400'}\`}
              title="عرض شبكي"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={\`p-1.5 rounded-md transition-all \${viewType === 'list' ? 'bg-white shadow-xs text-orange-500' : 'text-slate-400'}\`}
              title="عرض قائمة مضغوط وطويل"
            >
              <List size={13} />
            </button>
          </div>
        </div>`;

  const subBarNew = `{/* ── Subheader controlbar & Grid/List toggler ── */}
        {showSearch && (
          <div className="relative mb-3 animate-in fade-in slide-in-from-top-2">
            <input
              type="text"
              placeholder="البحث في الدليل..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
              autoFocus
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            {search && <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
          </div>
        )}
        <div className="flex items-center justify-between mb-3 px-1.5">
          <div className="text-right">
            <h3 className="text-xs font-black text-slate-800">
              {marketTab === 'offers' ? 'أحدث العروض الحصرية النشطة' :
               marketTab === 'restaurants' ? 'جميع المطاعم وجلسات الطعام المعتمدة' :
               marketTab === 'gyms' ? 'قاعات كمال الأجسام والفيتنس' :
               'جميع المعارض المعتمدة'}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {marketTab === 'offers' ? 'عروض وتخفيضات خاصة' :
               marketTab === 'restaurants' ? 'اطلب الان بكل سهولة' :
               marketTab === 'gyms' ? 'سجل معنا الأن' :
               'سيارات جديدة ومستعملة'}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={\`p-1.5 rounded-md transition-all \${showSearch || search ? 'bg-white shadow-xs text-orange-500' : 'text-slate-400'}\`}
              title="البحث"
            >
              <Search size={13} />
            </button>
            <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />
            <button
              onClick={() => setViewType('grid')}
              className={\`p-1.5 rounded-md transition-all \${viewType === 'grid' ? 'bg-white shadow-xs text-orange-500' : 'text-slate-400'}\`}
              title="عرض شبكي"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={\`p-1.5 rounded-md transition-all \${viewType === 'list' ? 'bg-white shadow-xs text-orange-500' : 'text-slate-400'}\`}
              title="عرض قائمة مضغوط وطويل"
            >
              <List size={13} />
            </button>
          </div>
        </div>`;

  if (code.includes('── Subheader controlbar')) {
    code = code.replace(subBarOriginal, subBarNew);
  } else {
    // maybe parts of it changed, fallback replacement using regexp
    code = code.replace(
      /\{\/\* ── Subheader controlbar[\s\S]*?<\/div>\s*<\/div>/,
      subBarNew
    );
  }

  // Also remove the "البحث في الدليل..." input earlier if it exists (my first regex might have missed if slightly different)
  code = code.replace(/<div className="relative mb-4">\s*<input\s*type="text"\s*placeholder="البحث في الدليل\.\.\."[\s\S]*?<\/button>\}\s*<\/div>/, '');

  fs.writeFileSync(path, code, 'utf8');
}

['src/pages/MarketPage.tsx', 'admin_panel/src/pages/MarketPage.tsx'].forEach(p => fs.existsSync(p) && fix(p));
console.log('Market search updated');

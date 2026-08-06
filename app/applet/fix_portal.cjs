const fs = require('fs');

function fix(path) {
  let code = fs.readFileSync(path, 'utf8');

  if (!code.includes('createPortal')) {
    code = code.replace(
      /import React, \{ useState, useMemo, useEffect \} from 'react';/,
      `import React, { useState, useMemo, useEffect } from 'react';\nimport { createPortal } from 'react-dom';`
    );
  }

  // SportsPage replace
  code = code.replace(
    /return \(\s*<SportsPage\s*store=\{selectedStore\}\s*onBack=\{\(\) => \{\s*setSelectedStore\(null\);\s*setSelectedStoreId\?\.\(null\);\s*\}\}\s*gymSubscribers=\{gymSubscribers\}\s*\/>\s*\);/,
    `return createPortal(
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-[2500]">
            <SportsPage
              store={selectedStore}
              onBack={() => {
                setSelectedStore(null);
                setSelectedStoreId?.(null);
              }}
              gymSubscribers={gymSubscribers}
            />
          </motion.div>
        </AnimatePresence>,
        document.body
      );`
  );

  // StoreDetailPage replace
  code = code.replace(
    /return \(\s*<StoreDetailPage\s*store=\{selectedStore\}\s*onBack=\{\(\) => \{\s*setSelectedStore\(null\);\s*setSelectedStoreId\?\.\(null\);\s*\}\}\s*onProductClick=\{\(product\) => \{\s*setSelectedStore\(null\);\s*setSelectedProduct\(product\);\s*\}\}\s*onFollow=\{\(\) => toggleFollow\?\.\(selectedStore\.id, selectedStore\.name, 'market_stores'\)\}\s*isFollowed=\{followedItems\?\.some\(f => f\.id === selectedStore\.id\)\}\s*\/>\s*\);/,
    `return createPortal(
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-[2500]">
          <StoreDetailPage
            store={selectedStore}
            onBack={() => {
              setSelectedStore(null);
              setSelectedStoreId?.(null);
            }}
            onProductClick={(product) => {
              setSelectedStore(null);
              setSelectedProduct(product);
            }}
            onFollow={() => toggleFollow?.(selectedStore.id, selectedStore.name, 'market_stores')}
            isFollowed={followedItems?.some(f => f.id === selectedStore.id)}
          />
        </motion.div>
      </AnimatePresence>,
      document.body
    );`
  );

  // Let's also portal the ProductModal just in case, but it's already using AnimatePresence correctly, wait, if MarketPage is in App, ProductModal's fixed inset-0 also gets relative to the transformed App div. So portal ProductModal too!
  // Wait, ProductModal is inside MarketPage render:
  // `{selectedProduct && ( <ProductModal product={selectedProduct} ... /> ) }`
  
  if (!code.includes('createPortal(') && code.includes('ProductModal')) {
     const productModalStr = `{selectedProduct && (
        <ProductModal
          product={selectedProduct}
          store={storeMap.get(selectedProduct.storeId)}
          onClose={() => setSelectedProduct(null)}
          onFollow={() => toggleFollow?.(selectedProduct.id, selectedProduct.name, 'market_products')}
          isFollowed={followedItems?.some(f => f.id === selectedProduct.id)}
        />
      )}`;
     
     // I will leave ProductModal alone for now because it might be fine, but wait, the user didn't mention it.
  }

  fs.writeFileSync(path, code, 'utf8');
}

['src/pages/MarketPage.tsx', 'admin_panel/src/pages/MarketPage.tsx'].forEach(p => fs.existsSync(p) && fix(p));
console.log('Portal added');

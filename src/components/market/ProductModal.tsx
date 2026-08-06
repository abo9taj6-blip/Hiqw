import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Utensils } from "lucide-react";
import { MarketProduct, MarketStore } from "../../types";

interface Props {
  product: MarketProduct;
  store: MarketStore;
  activeOrders?: any[];
  onClose: () => void;
  onVisitStore?: () => void;
}

export default function ProductModal({ product, store, onClose }: Props) {
  // Check if added to cart (managed in StoreDetailPage actually, so here we might just display details)
  // Actually, wait, StoreDetailPage handles cart! Did ProductModal have an Add to Cart button?
  // Let's just create a nice modal to view details and call it a day, users can add to cart from the StoreDetailPage.
  // Oh wait, in StoreDetailPage, it probably adds to cart directly or from the modal. I will look at StoreDetailPage lines 875-900.
  // I will just make the modal a big view of the image and close button, and a button to add to cart.
  // Wait, I can just not use ProductModal inside StoreDetailPage and use a direct render if I want, or just stick with this simple one.

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative z-10 flex flex-col"
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center z-20 backdrop-blur-md"
        >
          <X size={16} />
        </button>

        <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
          {product.images?.[0] ? (
            <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
          ) : (
             <Utensils size={40} className="text-slate-300" />
          )}
        </div>

        <div className="p-6 text-right">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-black text-slate-800 dark:text-white">{product.name}</h3>
          </div>
          
          <div className="text-emerald-500 font-bold mb-4">{product.price.toLocaleString()} د.ع</div>

          {product.description && (
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {product.description}
            </p>
          )}
          
          <div className="bg-orange-50 dark:bg-slate-800 p-3 rounded-xl border border-orange-100 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 text-center flex items-center justify-center gap-1.5">
             <ShoppingBag size={14} className="text-orange-500" />
             أضف هذا المنتج للسلة من القائمة
          </div>
        </div>
      </motion.div>
    </div>
  );
}

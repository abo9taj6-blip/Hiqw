import React from "react";
import { motion } from "framer-motion";
import { X, Utensils, Phone } from "lucide-react";
import { MarketProduct, MarketStore, formatPriceDisplay } from "../../types";

interface Props {
  product: MarketProduct;
  store: MarketStore;
  activeOrders?: any[];
  onClose: () => void;
  onVisitStore?: () => void;
}

export default function ProductModal({ product, store, onClose }: Props) {
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
          className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center z-20 backdrop-blur-md cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
          {product.images?.[0] ? (
            <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
          ) : (
             <Utensils size={40} className="text-slate-300" />
          )}
        </div>

        <div className="p-6 text-right">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-black text-slate-800 dark:text-white">{product.name}</h3>
          </div>
          
          <div className="text-emerald-500 font-bold mb-4">{formatPriceDisplay(product.price)}</div>

          {product.description && (
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              {product.description}
            </p>
          )}

          {store.phone && (
            <a
              href={`tel:${store.phone}`}
              className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Phone size={14} />
              <span>اتصال للطلب والاستفسار</span>
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}

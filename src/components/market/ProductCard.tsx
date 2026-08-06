import React from "react";
import { MarketProduct } from "../../types";
import { Utensils } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductCard({
  product,
  onClick,
  store,
  hideStoreBadge,
  isThreeColumn,
}: {
  product: MarketProduct;
  onClick: () => void;
  store?: any;
  hideStoreBadge?: boolean;
  isThreeColumn?: boolean;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl flex cursor-pointer group shadow-xs ${
        isThreeColumn 
          ? "flex-col p-2 text-center items-center justify-center min-h-[140px]" 
          : "items-center justify-between p-3"
      }`}
    >
      <div className={`flex gap-3 ${isThreeColumn ? "flex-col items-center justify-center w-full" : "items-center"}`}>
        <div className={`bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 ${
          isThreeColumn ? "w-14 h-14" : "w-16 h-16"
        }`}>
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Utensils size={isThreeColumn ? 16 : 20} className="text-slate-350" />
          )}
        </div>
        <div className={`space-y-1 ${isThreeColumn ? "text-center w-full" : "text-right"}`}>
          <h4 className="font-black text-slate-800 dark:text-white text-xs sm:text-sm line-clamp-1">{product.name}</h4>
          {product.description && !isThreeColumn && (
            <p className="text-[10px] text-slate-450 dark:text-slate-500 line-clamp-1 font-bold">{product.description}</p>
          )}
          <div className="text-xs font-black text-emerald-500">
            {product.price > 0 ? `${product.price.toLocaleString()} د.ع` : "مجاني"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

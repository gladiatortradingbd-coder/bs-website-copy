"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const Cart = ({ className = "", iconClassName = "", badgeClassName = "", count = 0 }) => {
  const { openCart } = useCart();

  return (
    <button type="button" onClick={openCart} className={`relative flex items-center justify-center p-2 group ${className}`} aria-label="Open cart drawer">
      <ShoppingCart
        className={`
          cursor-pointer
          h-6
          w-6
          text-foreground
          transition-all duration-300
          group-hover:scale-110
          group-hover:text-[#065f46]
          ${iconClassName}
        `}
      />

      <span
        className={`
          absolute
          -top-1
          -right-2
          min-w-4.5
          h-4.5
          px-1
          flex
          items-center
          justify-center
          rounded-full
          bg-[#065f46]
          text-white dark:text-black
          text-[10px]
          font-semibold
          leading-none
          border border-white dark:border-black
          shadow-sm
          ${badgeClassName}
        `}
      >
        {count}
      </span>
    </button>
  );
};

export default Cart;
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import WishlistToggle from "@/components/ui/WishlistToggle";

export default function ProductsGrid({ products = [] }) {
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const createCartItem = (product) => ({
    id: product.id,
    key: product.id,
    title: product.title,
    price: product.price,
    image: product.photos[0] ?? "",
    photos: product.photos,
    stock: product.stock ?? null,
  });

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6 lg:grid-cols-4">
      {products.map((product) => {
        const stockCount = product.stock ?? null;
        const isAvailable = stockCount === null ? true : stockCount > 0;

        return (
          <article key={product.id} className="overflow-hidden rounded-2xl border border-border-color bg-background shadow-[0_8px_28px_rgba(0,0,0,0.05)] sm:rounded-3xl sm:shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: "4 / 5" }}>
              {product.photos[0] ? <Image src={product.photos[0]} alt={product.title} fill className="object-cover" /> : null}

              <span className={`absolute left-2 top-2 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {isAvailable ? (stockCount === null ? "In stock" : `${stockCount} left`) : "Out of stock"}
              </span>

              <WishlistToggle
                item={{
                  key: product.id,
                  id: product.id,
                  name: product.title,
                  price: product.price,
                  image: product.photos[0] ?? "",
                  href: `/shop/${product.id}`,
                  cartItem: {
                    id: product.id,
                    key: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.photos[0] ?? "",
                    photos: product.photos,
                    stock: product.stock ?? null,
                  },
                }}
                ariaLabel={`Toggle ${product.title} in wishlist`}
                className="absolute right-2 top-2 z-10 h-9 w-9 rounded-full border border-white/10 dark:border-black/10 bg-black/45 dark:bg-white/45 text-white dark:text-black backdrop-blur-sm hover:bg-black/65 dark:hover:bg-white/65 hover:text-rose-400 sm:right-3 sm:top-3 sm:h-11 sm:w-11"
                iconClassName="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5"
              />
            </div>

            <div className="p-2.5 sm:p-4">
              <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">{product.title}</h2>
              <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground sm:text-sm">{product.category}</p>
              <p className="mt-1.5 text-xs font-medium sm:mt-2 sm:text-sm">Tk {product.price}</p>

              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3">
                <Link href={`/shop/${product.id}`} className="inline-flex h-8 items-center justify-center rounded-lg border border-border-color px-2 text-[11px] font-medium sm:h-10 sm:rounded-xl sm:px-4 sm:text-sm">
                  View
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg px-2 text-[11px] font-medium sm:h-10 sm:rounded-xl sm:px-4 sm:text-sm"
                  onClick={() => {
                    if (!isAvailable) {
                      showToast({
                        title: "Out of stock",
                        description: `${product.title} is currently unavailable.`,
                        variant: "warning",
                      });
                      return;
                    }

                    const wasAdded = addItem(createCartItem(product), 1);
                    if (!wasAdded) {
                      showToast({
                        title: "Out of stock",
                        description: `${product.title} is currently unavailable.`,
                        variant: "warning",
                      });
                      return;
                    }

                    openCart();
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isAvailable ? "Add to cart" : "Out of stock"}
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="col-span-2 h-8 rounded-lg px-2 text-[11px] font-medium sm:h-10 sm:rounded-xl sm:px-4 sm:text-sm"
                  onClick={() => {
                    if (!isAvailable) {
                      showToast({
                        title: "Out of stock",
                        description: `${product.title} is currently unavailable.`,
                        variant: "warning",
                      });
                      return;
                    }

                    const wasAdded = addItem(createCartItem(product), 1);
                    if (!wasAdded) {
                      showToast({
                        title: "Out of stock",
                        description: `${product.title} is currently unavailable.`,
                        variant: "warning",
                      });
                      return;
                    }

                    openCart();
                    router.push("/checkout");
                  }}
                >
                  {isAvailable ? "Buy now" : "Out of stock"}
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

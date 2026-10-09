"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "@/lib/iconify";
import { Heart, MessageCircleMore, ShoppingCart, Store, UserRound, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSession } from "next-auth/react";
import Image from "next/image";

const socialActions = [
  {
    label: "WhatsApp",
    href: "https://wa.me/8801850328338",
    icon: "mdi:whatsapp",
    color: "#000000",
    offset: "-translate-x-9 -translate-y-10",
  },
  {
    label: "Messenger",
    href: "https://www.facebook.com/aarong/",
    icon: "mdi:facebook-messenger",
    color: "#000000",
    offset: "translate-x-0 -translate-y-14",
  },
  {
    label: "Call",
    href: "tel:+8801850328338",
    icon: "mdi:phone",
    color: "#000000",
    offset: "translate-x-9 -translate-y-10",
  },
];

export default function MobileFooterNav() {
  const [chatOpen, setChatOpen] = useState(false);
  const { items, openCart } = useCart();
  const { count } = useWishlist();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  
  const { data: session } = useSession();
  const user = session?.user;

  const displayCount = isHydrated ? count : 0;
  const displayCartCount = isHydrated ? items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="mx-auto max-w-7xl px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="rounded-[28px] border border-border-color/80 bg-background/92 px-3 py-3 shadow-[0_-18px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <div className="grid grid-cols-5 items-end gap-1">
            <FooterAction href="/shop" label="Shop" icon={<Store className="h-6 w-6" />} />

            <FooterAction
              label="Profile"
              href={user ? "/admin" : "/login"}
              icon={
                user?.image ? (
                  <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-muted">
                    <Image
                      src={user.image}
                      alt={user.fullName || user.name || "User"}
                      width={24}
                      height={24}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : user ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                    {(user.fullName || user.name || user.email || "U").slice(0, 1).toUpperCase()}
                  </div>
                ) : (
                  <UserRound className="h-6 w-6" />
                )
              }
            />

            <div className="relative flex justify-center pb-1">
              <div className="relative flex h-16 w-16 items-center justify-center">
                {socialActions.map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    target={action.href.startsWith("http") ? "_blank" : undefined}
                    rel={action.href.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={action.label}
                    className={`absolute flex h-10 w-10 items-center justify-center rounded-full border border-border-color bg-background shadow-lg transition-all duration-300 ${chatOpen ? `${action.offset} opacity-100 scale-100` : "translate-y-3 opacity-0 scale-50 pointer-events-none"}`}
                    style={{ color: action.color }}
                  >
                    <Icon icon={action.icon} className="text-[20px]" />
                  </a>
                ))}

                <button
                  type="button"
                  onClick={() => setChatOpen((open) => !open)}
                  aria-label={chatOpen ? "Close chat actions" : "Open chat actions"}
                  aria-expanded={chatOpen}
                  className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black shadow-[0_10px_28px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:scale-105"
                >
                  {chatOpen ? <X className="h-6 w-6" /> : <MessageCircleMore className="h-6 w-6" />}
                </button>
              </div>
            </div>

            <FooterAction
              href="/wishlist"
              label="Wishlist"
              icon={
                <span className="relative inline-flex items-center justify-center">
                  <Heart className="h-6 w-6" />
                  {displayCount > 0 ? (
                    <span className="absolute -right-2 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border border-white dark:border-black bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white dark:text-black">
                      {displayCount}
                    </span>
                  ) : null}
                </span>
              }
            />
            <FooterAction
              label="Cart"
              as="button"
              onClick={openCart}
              icon={
                <span className="relative inline-flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="absolute -right-2 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border border-white dark:border-black bg-[#065f46] px-1 text-[10px] font-semibold leading-none text-white dark:text-black">
                    {displayCartCount}
                  </span>
                </span>
              }
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

function FooterAction({ href, label, icon, as = "link", onClick }) {
  const baseClass = "flex flex-col items-center justify-end gap-1 rounded-2xl px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:text-foreground";

  if (href) {
    return (
      <Link href={href} className={baseClass} aria-label={label}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  if (as === "button") {
    return (
      <button type="button" onClick={onClick} className={baseClass} aria-label={label}>
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link href="/login" className={baseClass} aria-label="Profile">
      {icon}
      <span>{label}</span>
    </Link>
  );
}
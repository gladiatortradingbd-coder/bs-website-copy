"use client";

import { Suspense, useEffect } from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MapPin, Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Cart from "@/components/ui/Cart";
import SearchBar from "@/components/ui/SearchBar";
import WishlistLink from "@/components/ui/WishlistLink";
import UserMenu from "@/components/layout/UserMenu";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#categories", label: "Category" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/track-order", label: "Track order" },
  { href: "/blog", label: "Blog" },
];

function isNavActive(href, pathname) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false; // Don't highlight hash links just because we're on the root path
  return pathname.startsWith(href);
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { items } = useCart();
  const pathname = usePathname();
  const cartCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <header className="my-2 w-full bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className=" px-2 py-4 md:hidden ">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[11px] font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-[#065f46]" />
                  <span>Location</span>
                </div>

                <div className="mt-1">
                  <div className="rounded-full bg-gray-50 dark:bg-neutral-800 px-3 py-1.5 text-[12px] font-medium text-foreground">
                    Dhaka, Bangladesh
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <WishlistLink className="group rounded-full p-2" />

              <Cart count={cartCount} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image
                src="https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780246876/logo3_n16yjz.png"
                width={44}
                height={44}
                alt="Logo"
                className="rounded-full"
              />
            </Link>

            <Suspense fallback={null}>
              <SearchBar
                placeholder="Search sarees..."
                className="flex-1 bg-background"
                submitHref="/shop"
                filterHref="/shop"
                liveResultsEndpoint="/api/products"
                showFilters
              />
            </Suspense>

            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="group relative flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-full border border-border-color bg-background shadow-sm transition-all duration-300 hover:border-black dark:hover:border-white hover:bg-muted"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <span
                className={`block h-[2px] w-5 rounded-full bg-black dark:bg-white transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-3.5 rounded-full bg-black dark:bg-white transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? "w-0 opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-[2px] w-5 rounded-full bg-black dark:bg-white transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="hidden items-center justify-between border-b border-gray-100 dark:border-neutral-700 py-3 md:flex">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Location</span>

            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-0 py-0 text-sm font-medium text-foreground hover:bg-transparent hover:text-[#065f46]"
            >
              <MapPin className="h-4.5 w-4.5" />
              <span>Dhaka, Bangladesh</span>
              <ChevronDown className="h-4.5 w-4.5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <UserMenu />
            ) : (
              <>
                <Button href="/login" variant="primary" size="sm" className="px-4 py-1.5 text-sm">
                  Login
                </Button>
                <Button href="/signup" variant="secondary" size="sm" className="px-4 py-1.5 text-sm">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="hidden items-center justify-between gap-8 py-4 md:flex">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex shrink-0 cursor-pointer items-center gap-3">
              <Image
                src="https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780246876/logo3_n16yjz.png"
                width={65}
                height={65}
                alt="Logo"
                className="rounded-full"
              />

              <div className="flex flex-col leading-tight">
                <div className="mx-auto text-[14px] font-bold tracking-widest">Aarong</div>
              </div>
            </Link>

            <nav className="flex items-center gap-1 text-[15px] font-medium">
              {navLinks.map((link) => (
                <NavItem key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Suspense fallback={null}>
              <SearchBar
                placeholder="Search sarees..."
                className="hidden w-60 lg:flex bg-background"
                submitHref="/shop"
                filterHref="/shop"
                liveResultsEndpoint="/api/products"
                showFilters
              />
            </Suspense>

            <WishlistLink className="group rounded-full p-2" />

            <Cart count={cartCount} />
          </div>
        </div>

        {/* Full-Screen Mobile Navigation Overlay */}
        <div
          id="mobile-navigation"
          className={`fixed inset-0 z-50 md:hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            mobileMenuOpen ? "visible" : "invisible pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/40 dark:bg-white/40 backdrop-blur-sm transition-opacity duration-500 ${
              mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding Menu Panel */}
          <div 
            className={`absolute inset-x-0 top-0 max-h-[90dvh] overflow-y-auto rounded-b-[32px] bg-background/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <div className="flex flex-col gap-5 pt-2">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-2">
                <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <Image
                    src="https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780246876/logo3_n16yjz.png"
                    width={48}
                    height={48}
                    alt="Logo"
                    className="rounded-full shadow-sm"
                  />
                  <div className="flex flex-col leading-tight">
                    <div className="text-[16px] font-bold tracking-widest text-foreground">Aarong</div>
                  </div>
                </Link>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Suspense fallback={null}>
                  <SearchBar
                    placeholder="Search sarees..."
                    className="w-full bg-background shadow-sm border border-gray-100 dark:border-neutral-700"
                    compact
                    submitHref="/shop"
                    filterHref="/shop"
                    liveResultsEndpoint="/api/products"
                    resultsPlacement="stack"
                    showFilters
                  />
                </Suspense>
              </div>

              {/* Navigation Links (Staggered Animation) */}
              <nav className="flex flex-col gap-1 mt-2">
                {navLinks.map((link, i) => (
                  <MobileNavItem 
                    key={link.href} 
                    href={link.href} 
                    label={link.label} 
                    pathname={pathname}
                    index={i}
                    isOpen={mobileMenuOpen}
                    onClick={() => setMobileMenuOpen(false)} 
                  />
                ))}
              </nav>

              <hr className="border-gray-100 dark:border-neutral-700 my-2" />

              {/* Location */}
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-neutral-800 px-4 py-3 border border-gray-100 dark:border-neutral-700">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Location</span>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-[#065f46]" />
                    <span className="text-sm font-medium text-foreground">Dhaka, Bangladesh</span>
                  </div>
                </div>
              </div>

              {/* Auth */}
              <div className="mt-1">
                {session ? (
                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-neutral-800 p-3 border border-gray-100 dark:border-neutral-700">
                    <div className="flex items-center gap-3">
                      <UserMenu menuPosition="mobile" compact={false} />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-foreground">
                          {session.user?.fullName || session.user?.name || "My Account"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">Manage profile & settings</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button href="/login" variant="primary" size="sm" className="justify-center px-4 py-3.5 text-sm rounded-xl shadow-md">Login</Button>
                    <Button href="/signup" variant="secondary" size="sm" className="justify-center px-4 py-3.5 text-sm rounded-xl">Sign up</Button>
                  </div>
                )}
              </div>

              {/* Wishlist & Cart */}
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 px-5 py-4 mb-2 mt-1">
                <WishlistLink
                  showLabel
                  className="h-auto p-0 text-sm font-semibold text-foreground hover:text-[#065f46]"
                />
                <div className="h-6 w-px bg-gray-200 dark:bg-neutral-600"></div>
                <Cart count={cartCount} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavItem({ href, label, pathname }) {
  const isActive = isNavActive(href, pathname);

  return (
    <Link
      href={href}
      className={`group relative cursor-pointer px-3 py-2`}
    >
      <span className={`transition-colors duration-300 ${isActive ? "text-[#065f46] font-semibold" : "text-foreground hover:text-[#065f46]"}`}>
        {label}
      </span>
      <span className={`absolute left-0 bottom-0 h-0.5 bg-[#065f46] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
    </Link>
  );
}

function MobileNavItem({ href, label, pathname, index, isOpen, onClick }) {
  const isActive = isNavActive(href, pathname);
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center justify-between rounded-2xl px-5 py-3.5 transition-all duration-300 ${
        isActive ? "bg-[#065f46]/10" : "hover:bg-gray-50 dark:hover:bg-neutral-800"
      }`}
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(-20px)",
        opacity: isOpen ? 1 : 0,
        transition: `transform 0.4s cubic-bezier(0.32, 0.72, 0, 1) ${index * 60 + 100}ms, opacity 0.4s ease ${index * 60 + 100}ms, background-color 0.2s ease`
      }}
    >
      <span className={`text-[16px] transition-colors duration-300 ${isActive ? "font-bold text-[#065f46]" : "font-medium text-foreground group-hover:text-foreground"}`}>
        {label}
      </span>
      {isActive && (
        <span className="h-2 w-2 rounded-full bg-[#065f46]" />
      )}
    </Link>
  );
}
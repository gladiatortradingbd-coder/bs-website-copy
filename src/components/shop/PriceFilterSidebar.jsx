"use client";

import { useEffect, useMemo, useState } from "react";
import { MOBILE_CATEGORY_CHIPS } from "@/lib/categories";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEFAULT_MAX_PRICE = 10000;
const PRICE_STEP = 10;

function formatPrice(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numericValue.toLocaleString("en-US");
}

export default function PriceFilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [priceLimit, setPriceLimit] = useState(() => searchParams.get("maxPrice") ?? String(DEFAULT_MAX_PRICE));
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [mobilePanelMounted, setMobilePanelMounted] = useState(false);
  const [categories, setCategories] = useState(MOBILE_CATEGORY_CHIPS);

  useEffect(() => {
    let ignore = false;
    fetch("/api/category-images", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!ignore && Array.isArray(data.categories)) {
          setCategories([{ slug: "all", title: "All" }, ...data.categories]);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (mobilePanelOpen) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setMobilePanelMounted(false);
    }, 220);

    return () => clearTimeout(timer);
  }, [mobilePanelOpen]);

  const currentCategory = searchParams.get("category") ?? "all";

  const numericLimit = useMemo(() => {
    const parsed = Number(priceLimit);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_MAX_PRICE;
  }, [priceLimit]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextParams = new URLSearchParams(searchParams.toString());
    const trimmedLimit = String(priceLimit ?? "").trim();

    if (trimmedLimit) {
      nextParams.set("maxPrice", trimmedLimit);
    } else {
      nextParams.delete("maxPrice");
    }

    const targetUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    router.push(targetUrl);
  };

  const handleReset = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("maxPrice");

    const targetUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    router.push(targetUrl);
  };

  const handleCategoryClick = (slug) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (slug === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", slug);
    }

    const targetUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    router.push(targetUrl);
  };

  const sliderProgress = `${Math.min((numericLimit / DEFAULT_MAX_PRICE) * 100, 100)}%`;

  const openMobilePanel = () => {
    setMobilePanelMounted(true);
    setMobilePanelOpen(true);
  };

  const closeMobilePanel = () => {
    setMobilePanelOpen(false);
  };

  return (
    <div id="woocommerce_price_filter-5" className="wd-widget widget sidebar-widget woocommerce widget_price_filter rounded-[28px] border border-border-color bg-background p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <h5 className="widget-title text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Filter by price</h5>

      {/* Mobile: show a single button that toggles the filter panel */}
      <div className="sm:hidden mt-4">
        <button
          type="button"
          onClick={openMobilePanel}
          aria-expanded={mobilePanelOpen}
          className="inline-flex w-full items-center justify-between rounded-2xl border border-border-color bg-background px-4 py-3 text-sm font-medium text-foreground"
        >
          <span>Filter Products</span>
          <ChevronDown className={"ml-2 h-4 w-4 transition-transform duration-300 " + (mobilePanelOpen ? "rotate-180" : "")} />
        </button>

        {mobilePanelMounted ? (
          <div className={"fixed inset-0 z-50 sm:hidden " + (mobilePanelOpen ? "pointer-events-auto" : "pointer-events-none")}>
            <button
              type="button"
              aria-label="Close filters"
              onClick={closeMobilePanel}
              className={
                "absolute inset-0 bg-black/50 dark:bg-white/50 transition-opacity duration-300 " +
                (mobilePanelOpen ? "opacity-100" : "opacity-0")
              }
            />

            <div
              className={
                "absolute right-0 top-0 h-full w-[88vw] max-w-sm overflow-y-auto rounded-l-[32px] bg-background p-5 shadow-[-24px_0_80px_rgba(0,0,0,0.18)] transition-all duration-300 " +
                (mobilePanelOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0")
              }
            >
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-muted" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h6 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">Filter Products</h6>
                  <p className="mt-1 text-xs text-muted-foreground">Choose a category and price range.</p>
                </div>

                <button
                  type="button"
                  onClick={closeMobilePanel}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-color text-foreground"
                  aria-label="Close filter panel"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <h6 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Categories</h6>
                  <div className="mt-3 flex flex-col gap-2">
                    {categories.map((c) => {
                      const active = String(c.slug || "").toLowerCase() === String(currentCategory || "").toLowerCase();

                      return (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => {
                            handleCategoryClick(c.slug);
                            closeMobilePanel();
                          }}
                          className={
                            "rounded-2xl border px-3 py-2 text-left text-sm font-medium transition-colors " +
                            (active ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black" : "border-border-color bg-background text-foreground")
                          }
                        >
                          {c.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form
                  method="get"
                  action="/shop"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit(event);
                    closeMobilePanel();
                  }}
                >
                  <div className="price_slider_wrapper">
                    <div className="price_slider ui-slider ui-corner-all ui-slider-horizontal ui-widget ui-widget-content relative h-2 rounded-full bg-muted">
                      <div
                        className="ui-slider-range ui-corner-all ui-widget-header absolute inset-y-0 left-0 rounded-full bg-[#065f46]"
                        style={{ width: sliderProgress }}
                      />
                      <input
                        type="range"
                        min="0"
                        max={DEFAULT_MAX_PRICE}
                        step={PRICE_STEP}
                        value={numericLimit}
                        onChange={(event) => setPriceLimit(event.target.value)}
                        aria-label="Maximum price"
                        className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 appearance-none bg-transparent accent-[#065f46]"
                      />
                    </div>

                    <div className="price_slider_amount mt-4" data-step={PRICE_STEP}>
                      <label className="screen-reader-text sr-only" htmlFor="max_price">
                        Max price
                      </label>
                      <input type="hidden" id="min_price" name="min_price" value="0" />
                      <input type="hidden" id="max_price" name="maxPrice" value={String(numericLimit)} />

                      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>Min price: ৳ 0</span>
                        <span>Max price: ৳ {formatPrice(numericLimit)}</span>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="submit"
                          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-black dark:bg-white px-4 py-3 text-sm font-medium text-white dark:text-black transition-colors hover:bg-neutral-800"
                        >
                          Filter
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleReset();
                            closeMobilePanel();
                          }}
                          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-border-color bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:bg-muted"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Desktop / large screens: show full filter */}
      <div className="hidden sm:block mt-4">
        <h6 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Categories</h6>
        <div className="mt-3 flex flex-col gap-2">
          {categories.map((c) => {
            const active = String(c.slug || "").toLowerCase() === String(currentCategory || "").toLowerCase();

            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => handleCategoryClick(c.slug)}
                className={
                  "text-left rounded-2xl px-3 py-2 text-sm font-medium transition-colors " +
                  (active ? "bg-black dark:bg-white text-white dark:text-black" : "bg-background text-foreground border border-border-color")
                }
              >
                {c.title}
              </button>
            );
          })}
        </div>

        <form method="get" action="/shop" onSubmit={handleSubmit} className="mt-4">
          <div className="price_slider_wrapper">
            <div className="price_slider ui-slider ui-corner-all ui-slider-horizontal ui-widget ui-widget-content relative h-2 rounded-full bg-muted">
              <div
                className="ui-slider-range ui-corner-all ui-widget-header absolute inset-y-0 left-0 rounded-full bg-[#065f46]"
                style={{ width: sliderProgress }}
              />
              <input
                type="range"
                min="0"
                max={DEFAULT_MAX_PRICE}
                step={PRICE_STEP}
                value={numericLimit}
                onChange={(event) => setPriceLimit(event.target.value)}
                aria-label="Maximum price"
                className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 appearance-none bg-transparent accent-[#065f46]"
              />
            </div>

            <div className="price_slider_amount mt-4" data-step={PRICE_STEP}>
              <label className="screen-reader-text sr-only" htmlFor="max_price">
                Max price
              </label>
              <input type="hidden" id="min_price" name="min_price" value="0" />
              <input type="hidden" id="max_price" name="maxPrice" value={String(numericLimit)} />

              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Min price: ৳ 0</span>
                <span>Max price: ৳ {formatPrice(numericLimit)}</span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-black dark:bg-white px-4 text-sm font-medium text-white dark:text-black transition-colors hover:bg-neutral-800"
                >
                  Filter
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-border-color bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:bg-muted"
                >
                  Clear
                </button>
              </div>

              <div className="clear" />
            </div>
          </div>
        </form>
    </div>
    </div>
  );
}
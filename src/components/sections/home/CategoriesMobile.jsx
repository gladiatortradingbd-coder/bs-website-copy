"use client";

import Link from "next/link";
import { Icon } from "@/lib/iconify";
import { MOBILE_CATEGORY_CHIPS, getCategoryLink } from "@/lib/categories";

const categories = MOBILE_CATEGORY_CHIPS.map((category) => ({
  ...category,
  icon:
    category.title === "All"
      ? "solar:widget-5-bold"
      : category.title === "Plants"
        ? "solar:leaf-bold"
        : category.title === "Media"
          ? "hugeicons:soil-moisture-field"
          : category.title === "Planters"
            ? "ph:potted-plant-fill"
            : category.title === "Garden Accessories"
              ? "game-icons:gardening-shears"
              : "mdi:post-lamp",
}));

export default function CategoriesMobile() {
  return (
    <section className="md:hidden px-4 py-6 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Popular Categories
          </h3>

          <Link
            href="/shop"
            className="text-sm font-medium text-[#065f46]"
          >
            View All
          </Link>
        </div>

        <ul className="grid grid-cols-3 gap-4" aria-label="Popular categories">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={getCategoryLink(cat.slug)}
                className="group"
                aria-label={cat.title}
              >
                <span className="flex flex-col items-center text-center">
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border-color bg-background shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                    <span className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <Icon
                      icon={cat.icon}
                      width="30"
                      height="30"
                      className="relative text-[#065f46]"
                    />
                  </span>

                  <span className="mt-2 line-clamp-2 text-xs font-medium leading-tight text-foreground">
                    {cat.title}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
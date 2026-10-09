import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getHomepageCategoryCards } from "@/lib/category-images";
import HomepageCategoryCarousel from "./HomepageCategoryCarousel";

export default async function CategoriesSection() {
  const categoryCards = await getHomepageCategoryCards();
  const items = categoryCards.map((category) => ({
    src: category.image,
    alt: category.title,
    title: category.title,
    href: category.href,
  }));

  return (
    <section className="overflow-hidden px-4 py-14 sm:py-24" id="categories">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-700">Categories</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-6xl">
              Find your signature style
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Discover beautifully crafted sarees for celebrations, everyday elegance, and every special moment.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
          >
            Explore all collections
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="h-[390px] rounded-[28px] border border-border-color/70 bg-muted/40 p-2 sm:h-[560px] sm:p-4">
          <HomepageCategoryCarousel items={items} />
        </div>
      </div>
    </section>
  );
}

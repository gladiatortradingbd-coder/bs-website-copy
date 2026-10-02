import Image from "next/image";
import Link from "next/link";
import { getHomepageCategoryCards } from "@/lib/category-images";
import { ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import CategoriesMobile from "./CategoriesMobile";
import { getCategoryLink } from "@/lib/categories";

export default async function CategoriesSection() {
  const categoryCards = await getHomepageCategoryCards();
  const cardsBySlug = Object.fromEntries(categoryCards.map((card) => [card.slug, card]));

  return (
    <section className="px-4 py-8 sm:py-24" id="categories">
      <div className="max-w-7xl mx-auto">

        {/* Mobile-only category chips */}
        <CategoriesMobile />

        {/* TOP SECTION (hidden on mobile; we already show mobile chips) */}
        <div
          className="
            hidden
            md:flex
            flex-col
            md:flex-row
            md:items-end
            md:justify-between
            gap-6
            mb-14
          "
        >

          <FadeIn direction="up">
            <div className="max-w-2xl">
              <p className="uppercase tracking-[0.3em] text-emerald-700 text-sm font-medium mb-4">
                Categories
              </p>

              <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                Check Out Our Popular Categories
              </h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <div>
              <Button href="/shop" variant="primary" size="lg" className="btn-shimmer">
                Shop now
              </Button>
            </div>
          </FadeIn>
        </div>

        {/* MAIN GRID (desktop/tablet only) */}
        <div
          className="
            hidden
            md:grid
            grid-cols-1
            lg:grid-cols-[2fr_1fr]
            gap-6
          "
        >

          {/* =========================
              BOX A
          ========================== */}
          <div className="grid grid-rows-2 gap-6">

            {/* =========================
                BOX C
            ========================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* BOX E */}
              <CategoryCard
                title="Plants"
                image={cardsBySlug.plants?.image ?? "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243572/shrubs_sssy3v.jpg"}
                href={getCategoryLink("plants")}
              />

              {/* BOX F */}
              <CategoryCard
                title="Media"
                image={cardsBySlug.soil?.image ?? "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/cacti_jayknk.jpg"}
                href={getCategoryLink("soil")}
              />
            </div>

            {/* =========================
                BOX D
            ========================== */}
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-[0.9fr_1.1fr]
                gap-6
              "
            >

              {/* BOX G */}
              <CategoryCard
                title="Planters"
                image={cardsBySlug.planters?.image ?? "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/herbs_lwlidn.jpg"}
                href={getCategoryLink("planters")}
              />

              {/* BOX H */}
              <CategoryCard
                title="Garden Accessories"
                image={cardsBySlug["garden-accessories"]?.image ?? "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/bamboo_nl0mwr.jpg"}
                href={getCategoryLink("garden-accessories")}
              />
            </div>
          </div>

          {/* =========================
              BOX B
          ========================== */}
          <div
            className="
              grid
              grid-rows-[1.15fr_0.85fr]
              gap-6
            "
          >

            {/* BOX I */}
            <CategoryCard
              title="Air Plant Holders"
              image={cardsBySlug["air-plant-holders"]?.image ?? "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/orchids_fubtjf.jpg"}
              href={getCategoryLink("air-plant-holders")}
            />

            {/* BOX J */}
            <div
              className="
                bg-[#163020]
                rounded-4xl
                p-8
                flex
                flex-col
                justify-between
                text-white dark:text-black
                overflow-hidden
                relative
              "
            >

              <div>
                <p className="uppercase tracking-[0.2em] text-sm text-white/60 dark:text-black/60">
                  Special Offer
                </p>

                <h3 className="text-4xl font-bold mt-4 leading-tight">
                  Get 15% OFF
                </h3>

                <p className="text-white/70 dark:text-black/70 mt-4">
                  On your first purchase from our store.
                </p>
              </div>

              <Button href="/shop" variant="secondary" size="lg" className="btn-shimmer mt-8 w-fit border-0 bg-background text-foreground hover:bg-muted">
                Shop Now
                <ArrowUpRight size={18} />
              </Button>



              {/* DECORATIVE BLUR */}
              <div
                className="
                  absolute
                  -bottom-16
                  -right-16
                  w-52
                  h-52
                  bg-emerald-400/20
                  blur-3xl
                  rounded-full
                  animate-float
                "
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
    CATEGORY CARD
========================= */

function CategoryCard({ title, image, href }) {
  const CardInner = (
    <>
      {/* IMAGE */}
      <Image
        src={image}
        alt={title}
        fill
        className="
          object-cover
          transition-transform
          duration-700
          group-hover:scale-110
        "
      />

      {/* OVERLAY */}
      <div
        className="
          absolute
          inset-0
          pointer-events-none
          bg-linear-to-t
          from-black/50
          via-black/10
          to-transparent
        "
      />

      {/* CONTENT */}
      <div
        className="
          absolute
          bottom-5
          left-5
                  pointer-events-none
          right-5
          z-10
          flex
          items-end
          justify-between
          gap-4
        "
      >

        <h3
          className="
            text-white dark:text-black
            text-2xl
            leading-tight
            duration-300
            md:text-3xl
            font-semibold
          "
        >
          {title}
        </h3>

        <div
          className="
            bg-background/90
            backdrop-blur-md
            p-3
            rounded-full
            transition-transform
            duration-300
            group-hover:rotate-45
          "
        >
          <ArrowUpRight size={18} />
        </div>

      </div>
    </>
  );

  return href ? (
    <Link
      href={href}
      className="
        group
        relative
        overflow-hidden
        rounded-4xl
        min-h-105
        cursor-pointer
      "
    >
      {CardInner}
    </Link>
  ) : (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-4xl
        min-h-105
        cursor-pointer
      "
    >
      {CardInner}
    </article>
  );
}
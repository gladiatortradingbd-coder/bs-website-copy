import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

const articles = [
  {
    id: 1,
    title: "5 mistakes that slowly damage indoor plants",
    category: "Plant Care",
    date: "May 10, 2026",
    image:
      "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244848/photo-1466692476868-aef1dfb1e735_gbp9gb.jpg",
  },
  {
    id: 2,
    title: "How to water succulents properly in hot weather",
    category: "Succulent Guide",
    date: "May 08, 2026",
    image:
      "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780245134/photo-1459156212016-c812468e2115_arngzp.jpg",
  },
];

export default function PlantCare() {
  return (
    <section className="px-4 py-12 sm:py-24 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* TOP CONTENT */}
        <header className="text-center">

          {/* SMALL BADGE */}
          <FadeIn direction="up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-color bg-background px-3 py-1 text-xs font-medium text-foreground sm:px-4 sm:py-2 sm:text-sm">
            <Leaf size={15} />
            Plant Care Guides
          </div>
          </FadeIn>

          {/* TITLE */}
          <FadeIn direction="up" delay={150}>
          <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-5xl">Learn how to care for your plants properly</h2>
          </FadeIn>

          {/* DESCRIPTION */}
          <FadeIn direction="up" delay={300}>
          <div className="mx-auto mt-4 max-w-2xl">
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Expert plant care tips, watering guides, styling ideas, and maintenance advice to help your plants thrive beautifully.
            </p>
          </div>
          </FadeIn>
        </header>

        {/* ARTICLES */}
        <ul className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2" aria-label="Plant care articles">
          {articles.map((article) => (
            <li key={article.id}>
              <article
                className="group cursor-pointer overflow-hidden rounded-4xl border border-border-color bg-background transition-all duration-500 hover:-translate-y-1 hover:border-black dark:hover:border-white hover:shadow-2xl"
              >
                <Link href="/blog" className="block">

                  {/* IMAGE */}
                  <div className="relative aspect-16/10 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-105
                    "
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 sm:p-7">

                    {/* META */}
                    <div className="flex items-center gap-3">

                      <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                        {article.category}
                      </div>

                      <span className="text-sm text-muted-foreground">
                        {article.date}
                      </span>
                    </div>

                    {/* TITLE */}
                    <h3 className="mt-4 text-2xl sm:text-3xl font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-muted-foreground">{article.title}</h3>

                    {/* READ MORE */}
                    <div className="mt-6 flex items-center gap-3">
                      <span
                        className="
                        text-sm
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                      "
                      >
                        Read Article
                      </span>

                      <div
                        className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-border-color
                        transition-all
                        duration-300
                        group-hover:bg-black dark:group-hover:bg-white
                        group-hover:text-white dark:group-hover:text-black
                        group-hover:translate-x-1
                      "
                      >
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>

        {/* BUTTON */}
        <nav className="mt-14 flex justify-center" aria-label="Plant care actions">
          <Link
            href="/blog"
            className="
              btn-shimmer
              inline-flex
              h-14
              items-center
              justify-center
              rounded-2xl
              border
              border-neutral-300
              bg-background
              px-8
              text-sm
              font-medium
              text-foreground
              transition-all
              duration-300
              hover:border-black dark:hover:border-white
              hover:bg-black dark:hover:bg-white
              hover:text-white dark:hover:text-black
            "
          >
            Browse all articles
          </Link>
        </nav>
      </div>
    </section>
  );
}
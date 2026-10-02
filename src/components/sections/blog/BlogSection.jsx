"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function BlogSection({ initialPosts = [] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(4);
  const posts = useMemo(() => initialPosts.filter(Boolean), [initialPosts]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(posts.map((post) => post.category).filter(Boolean));
    return ["All", ...uniqueCategories];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const list =
      activeCategory === "All"
        ? posts
        : posts.filter((post) => post.category === activeCategory);

    return list.slice(0, visibleCount);
  }, [activeCategory, visibleCount]);

  const hasMorePosts =
    (activeCategory === "All"
      ? posts.length
      : posts.filter((post) => post.category === activeCategory).length) >
    visibleCount;

  return (
    <section className="px-4 py-12 md:py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground md:text-5xl">Latest posts</h2>
          </div>

          {/* Categories */}
          <nav className="flex flex-wrap gap-3" aria-label="Blog categories">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "primary" : "outline"}
                size="md"
                onClick={() => {
                  setActiveCategory(category);
                  setVisibleCount(4);
                }}
                className="rounded-full px-5 py-2 text-sm font-medium"
              >
                {category}
              </Button>
            ))}
          </nav>
        </div>

        {/* Blog Grid */}
        <div className="mt-10">
          {filteredPosts.length > 0 ? (
            <ul className="grid gap-8 md:grid-cols-2" aria-label="Blog posts">
              {filteredPosts.map((post) => (
                <li key={post.id}>
                  <article>
                    <Link href={`/blog/${post.slug}`} className="group block cursor-pointer">
                      <div className="relative h-44 overflow-hidden rounded-3xl sm:h-70 md:h-85">
                        <Image
                          src={post.coverImage}
                          alt={post.coverAlt || post.title}
                          fill
                          unoptimized
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="mt-6">
                        <h3 className="text-xl font-semibold leading-snug text-foreground transition group-hover:text-green-700 sm:text-2xl">
                          {post.title}
                        </h3>

                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {post.excerpt}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
                            {post.category}
                          </span>

                          <span className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</span>
                          <span className="text-sm text-muted-foreground">{post.readingTime} min read</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-muted px-6 py-12 text-center text-sm text-muted-foreground">
              No blog posts are published yet.
            </div>
          )}
        </div>

        {/* Pagination Button */}
        <div className="mt-16 flex items-center justify-center">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="rounded-full px-8 py-3 text-sm font-semibold"
            onClick={() => setVisibleCount((current) => current + 4)}
            disabled={!hasMorePosts || filteredPosts.length === 0}
          >
            {hasMorePosts ? "Load More" : "No More Posts"}
          </Button>
        </div>
      </div>
    </section>
  );
}
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/blog";

// Pre-render published blog posts at build time (static pages)
export async function generateStaticParams() {
  try {
    const posts = await getPublishedBlogPosts({ limit: 100 });
    return posts.map((p) => ({ slug: p.slug }));
  } catch (err) {
    return [];
  }
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function splitContent(content) {
  return String(content ?? "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams?.slug);

  if (!post) {
    return {
      title: "Journal article not found | Aarong",
    };
  }

  return {
    title: post.metaTitle || `${post.title} | Aarong`,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage, alt: post.coverAlt || post.title }] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams?.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = (await getPublishedBlogPosts({ limit: 4 })).filter((item) => item.id !== post.id).slice(0, 3);
  const paragraphs = splitContent(post.content);

  return (
    <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="rounded-full bg-green-100 px-4 py-1 font-medium text-green-700">{post.category}</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>{post.readingTime} min read</span>
            <span>By {post.authorName}</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              {post.excerpt}
            </p>
          </div>
        </header>

        <div className="relative mt-8 overflow-hidden rounded-4xl border border-border-color bg-muted">
          <div className="relative aspect-video">
            <Image
              src={post.coverImage}
              alt={post.coverAlt || post.title}
              fill
              priority
              unoptimized
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-10 space-y-6 text-base leading-8 text-foreground sm:text-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={`${post.id}-paragraph-${index}`}>{paragraph}</p>
          ))}
        </div>

        {relatedPosts.length > 0 ? (
          <section className="mt-14 border-t border-border-color pt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">More posts</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Continue reading</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {relatedPosts.map((item) => (
                <a
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group overflow-hidden rounded-[28px] border border-border-color bg-background transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-4/3 bg-muted">
                    <Image
                      src={item.coverImage}
                      alt={item.coverAlt || item.title}
                      fill
                      unoptimized
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.category}</p>
                    <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-green-700">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{formatDate(item.publishedAt)}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
import BlogHero from "@/components/sections/blog/BlogHero";
import BlogPostsSection from "@/components/sections/blog/BlogSection";
import { getPublishedBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog | Succulent Hut",
  description: "SEO-friendly plant care articles, tips, and inspiration from Succulent Hut.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts({ limit: 50 });

  return (
    <main>
      <BlogHero />
      <BlogPostsSection initialPosts={posts} />
    </main>
  );
}
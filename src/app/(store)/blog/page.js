import BlogHero from "@/components/sections/blog/BlogHero";
import BlogPostsSection from "@/components/sections/blog/BlogSection";
import { getPublishedBlogPosts } from "@/lib/blog";

export const revalidate = 0;

export const metadata = {
  title: "Style Journal | Aarong",
  description: "Saree styling ideas, fabric guides, care tips, and inspiration from Aarong.",
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
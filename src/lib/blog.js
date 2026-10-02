import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { buildBlogSlug } from "@/lib/blog-shared";

export function estimateReadingTime(content) {
  const words = String(content ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

export function mapBlogPost(post) {
  if (!post) {
    return null;
  }

  const publishedAt = post.publishedAt ?? post.createdAt ?? null;

  return {
    id: String(post._id),
    title: post.title ?? "",
    slug: post.slug ?? "",
    category: post.category ?? "",
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    coverImage: post.coverImage ?? "",
    coverAlt: post.coverAlt ?? post.title ?? "",
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    authorName: post.authorName ?? "",
    status: post.status === "draft" ? "draft" : "published",
    featured: Boolean(post.featured),
    readingTime: estimateReadingTime(post.content),
    publishedAt,
    createdAt: post.createdAt ?? null,
    updatedAt: post.updatedAt ?? null,
  };
}

export async function getBlogCollection() {
  const client = await clientPromise;
  return client.db().collection("blogPosts");
}

export async function getPublishedBlogPosts({ limit = 50 } = {}) {
  const collection = await getBlogCollection();
  const posts = await collection
    .find({ status: "published" })
    .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 50, 1), 100))
    .toArray();

  return posts.map(mapBlogPost).filter(Boolean);
}

export async function getAllBlogPosts() {
  const collection = await getBlogCollection();
  const posts = await collection
    .find({})
    .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
    .toArray();

  return posts.map(mapBlogPost).filter(Boolean);
}

export async function getBlogPostBySlug(slug, { includeDrafts = false } = {}) {
  const normalizedSlug = buildBlogSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  const collection = await getBlogCollection();
  const query = { slug: normalizedSlug };

  if (!includeDrafts) {
    query.status = "published";
  }

  const post = await collection.findOne(query);
  return mapBlogPost(post);
}

export async function getBlogPostById(id) {
  const postId = String(id ?? "").trim();

  if (!ObjectId.isValid(postId)) {
    return null;
  }

  const collection = await getBlogCollection();
  const post = await collection.findOne({ _id: new ObjectId(postId) });
  return mapBlogPost(post);
}

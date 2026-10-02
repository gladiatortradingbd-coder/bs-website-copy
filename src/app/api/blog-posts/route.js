import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import { getBlogCollection, getPublishedBlogPosts, mapBlogPost } from "@/lib/blog";
import { buildBlogSlug } from "@/lib/blog-shared";
import { uploadPhotoToCloudinary } from "@/lib/cloudinary";

async function requireAdmin() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  if (session.user.role !== "admin") {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return { session };
}

function parseBoolean(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").trim().toLowerCase());
}

function parseDate(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);

  return Number.isNaN(date.getTime()) ? null : date;
}

async function findExistingSlug(collection, slug, excludeId = null) {
  const query = { slug };

  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }

  return collection.findOne(query, { projection: { _id: 1 } });
}

async function readBlogPayload(request, existingPost = null) {
  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const slug = buildBlogSlug(title, String(formData.get("slug") ?? "").trim());
  const category = String(formData.get("category") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const coverAlt = String(formData.get("coverAlt") ?? "").trim();
  const status = String(formData.get("status") ?? "published").trim().toLowerCase() === "draft" ? "draft" : "published";
  const featured = parseBoolean(formData.get("featured"));
  const coverImageSource = String(formData.get("coverImage") ?? "").trim();
  const publishedAt = parseDate(formData.get("publishedAt")) ?? existingPost?.publishedAt ?? (status === "published" ? new Date() : null);

  if (!title || !slug || !category || !excerpt || !content || !authorName) {
    return { error: NextResponse.json({ message: "Title, slug, category, excerpt, author, and content are required." }, { status: 400 }) };
  }

  if (!coverImageSource && !existingPost?.coverImage) {
    return { error: NextResponse.json({ message: "Please add a cover image." }, { status: 400 }) };
  }

  const coverImage = coverImageSource ? await uploadPhotoToCloudinary(coverImageSource) : existingPost.coverImage;

  return {
    data: {
      title,
      slug,
      category,
      excerpt,
      content,
      authorName,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      coverAlt: coverAlt || title,
      coverImage,
      status,
      featured,
      publishedAt,
      updatedAt: new Date(),
    },
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";

  if (all) {
    const guard = await requireAdmin();

    if (guard.error) {
      return guard.error;
    }

    const collection = await getBlogCollection();
    const posts = await collection
      .find({})
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ posts: posts.map(mapBlogPost).filter(Boolean) });
  }

  return NextResponse.json({ posts: await getPublishedBlogPosts({ limit: 100 }) });
}

export async function POST(request) {
  try {
    const guard = await requireAdmin();

    if (guard.error) {
      return guard.error;
    }

    const payload = await readBlogPayload(request);

    if (payload.error) {
      return payload.error;
    }

    const collection = await getBlogCollection();
    const existingSlug = await findExistingSlug(collection, payload.data.slug);

    if (existingSlug) {
      return NextResponse.json({ message: "A blog post with this slug already exists." }, { status: 409 });
    }

    const blogPost = {
      ...payload.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(blogPost);

    return NextResponse.json({
      message: "Blog post created successfully.",
      post: mapBlogPost({ ...blogPost, _id: result.insertedId }),
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not create blog post." },
      { status: 500 },
    );
  }
}

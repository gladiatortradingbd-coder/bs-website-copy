import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import { getBlogCollection, getBlogPostById, mapBlogPost } from "@/lib/blog";
import { buildBlogSlug } from "@/lib/blog-shared";
import { deletePhotoFromCloudinary, uploadPhotoToCloudinary } from "@/lib/cloudinary";

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

async function findExistingSlug(collection, slug, excludeId) {
  return collection.findOne({
    slug,
    _id: { $ne: new ObjectId(excludeId) },
  }, { projection: { _id: 1 } });
}

async function readBlogPayload(request, existingPost) {
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

  const coverImage = coverImageSource ? await uploadPhotoToCloudinary(coverImageSource) : existingPost?.coverImage;

  if (!coverImage) {
    return { error: NextResponse.json({ message: "Please add a cover image." }, { status: 400 }) };
  }

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

export async function GET(_request, { params }) {
  const guard = await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const resolvedParams = await params;
  const post = await getBlogPostById(resolvedParams?.id);

  if (!post) {
    return NextResponse.json({ message: "Blog post not found." }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(request, { params }) {
  try {
    const guard = await requireAdmin();

    if (guard.error) {
      return guard.error;
    }

    const resolvedParams = await params;
    const postId = String(resolvedParams?.id ?? "").trim();

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ message: "Invalid blog post id." }, { status: 400 });
    }

    const collection = await getBlogCollection();
    const existingPost = await collection.findOne({ _id: new ObjectId(postId) });

    if (!existingPost) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 });
    }

    const payload = await readBlogPayload(request, existingPost);

    if (payload.error) {
      return payload.error;
    }

    const slugMatch = await findExistingSlug(collection, payload.data.slug, postId);

    if (slugMatch) {
      return NextResponse.json({ message: "A blog post with this slug already exists." }, { status: 409 });
    }

    const existingCoverImage = existingPost.coverImage;
    const updatedBlogPost = {
      ...payload.data,
      updatedAt: new Date(),
    };

    await collection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: updatedBlogPost },
    );

    if (existingCoverImage && existingCoverImage !== updatedBlogPost.coverImage) {
      void deletePhotoFromCloudinary(existingCoverImage);
    }

    return NextResponse.json({
      message: "Blog post updated successfully.",
      post: mapBlogPost({ ...existingPost, ...updatedBlogPost, _id: existingPost._id }),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update blog post." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const guard = await requireAdmin();

    if (guard.error) {
      return guard.error;
    }

    const resolvedParams = await params;
    const postId = String(resolvedParams?.id ?? "").trim();

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ message: "Invalid blog post id." }, { status: 400 });
    }

    const collection = await getBlogCollection();
    const existingPost = await collection.findOne({ _id: new ObjectId(postId) });

    if (!existingPost) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(postId) });

    if (!result.deletedCount) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 });
    }

    if (existingPost.coverImage) {
      void deletePhotoFromCloudinary(existingPost.coverImage);
    }

    return NextResponse.json({ message: "Blog post deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not delete blog post." },
      { status: 500 },
    );
  }
}
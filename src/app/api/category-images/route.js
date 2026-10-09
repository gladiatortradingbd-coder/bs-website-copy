import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/auth";
import { deletePhotoFromCloudinary, uploadPhotoToCloudinary } from "@/lib/cloudinary";
import clientPromise from "@/lib/mongodb";
import { createCategorySlug, getFallbackCategory, HOMEPAGE_CATEGORY_CARDS } from "@/lib/categories";

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

function normalizeSlug(value) {
  return String(value ?? "").trim().toLowerCase();
}

export async function GET() {
  try {
    const client = await clientPromise;
    const records = await client.db().collection("category_images").find({}).toArray();
    const storedBySlug = new Map(records.map((record) => [String(record.slug ?? "").trim(), record]));
    const categories = HOMEPAGE_CATEGORY_CARDS.map((fallback) => ({
      slug: fallback.slug,
      title: String(storedBySlug.get(fallback.slug)?.title ?? fallback.title).trim(),
      image: String(storedBySlug.get(fallback.slug)?.image ?? fallback.image).trim(),
      href: fallback.href,
      updatedAt: storedBySlug.get(fallback.slug)?.updatedAt ?? null,
    }));
    const defaultSlugs = new Set(HOMEPAGE_CATEGORY_CARDS.map((category) => category.slug));

    for (const record of records) {
      const slug = String(record.slug ?? "").trim();
      const title = String(record.title ?? "").trim();
      const image = String(record.image ?? "").trim();

      if (slug && title && image && !defaultSlugs.has(slug)) {
        categories.push({
          slug,
          title,
          image,
          href: `/shop?category=${encodeURIComponent(slug)}`,
          updatedAt: record.updatedAt ?? null,
        });
      }
    }

    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not load categories." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const guard = await requireAdmin();

    if (guard.error) {
      return guard.error;
    }

    const formData = await request.formData();
    const requestedSlug = normalizeSlug(formData.get("slug"));
    const title = String(formData.get("title") ?? "").trim();
    const photoValue = formData.get("photo");
    const photo = typeof photoValue === "string" ? photoValue.trim() : "";

    if (!title) {
      return NextResponse.json({ message: "Category title is required." }, { status: 400 });
    }

    if (title.length > 80) {
      return NextResponse.json({ message: "Category title must be 80 characters or fewer." }, { status: 400 });
    }

    const slug = requestedSlug || createCategorySlug(title);
    if (!slug) {
      return NextResponse.json({ message: "Category title must contain letters or numbers." }, { status: 400 });
    }

    const fallback = getFallbackCategory(slug);
    const client = await clientPromise;
    const collection = client.db().collection("category_images");
    const existingCategory = await collection.findOne({ slug });
    const isNewCategory = !existingCategory && !fallback;
    if (isNewCategory && !photo) {
      return NextResponse.json({ message: "Please choose an image for the new category." }, { status: 400 });
    }

    const uploadedImage = photo
      ? await uploadPhotoToCloudinary(photo)
      : String(existingCategory?.image ?? fallback?.image ?? "").trim();
    if (!uploadedImage) {
      return NextResponse.json({ message: "Please choose a category image." }, { status: 400 });
    }
    const now = new Date();

    await collection.updateOne(
      { slug },
      {
        $set: {
          slug,
          title,
          image: uploadedImage,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true },
    );

    revalidatePath("/", "page");
    revalidatePath("/api/category-images");

    return NextResponse.json({
      message: "Category image updated successfully.",
      category: {
        slug,
        title,
        image: uploadedImage,
        updatedAt: now,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update the category image." },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const guard = await requireAdmin();
    if (guard.error) {
      return guard.error;
    }

    const slug = normalizeSlug(new URL(request.url).searchParams.get("slug"));
    if (!slug) {
      return NextResponse.json({ message: "Category slug is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const collection = client.db().collection("category_images");
    const existingCategory = await collection.findOne({ slug });
    if (!existingCategory) {
      return NextResponse.json({ message: "Category not found." }, { status: 404 });
    }

    const fallback = getFallbackCategory(slug);
    await collection.deleteOne({ slug });
    if (existingCategory.image && existingCategory.image !== fallback?.image) {
      await deletePhotoFromCloudinary(existingCategory.image);
    }
    revalidatePath("/", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/api/category-images");

    return NextResponse.json({
      message: fallback ? "Category changes reset successfully." : "Category deleted successfully.",
      category: fallback ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not delete category." },
      { status: 500 },
    );
  }
}
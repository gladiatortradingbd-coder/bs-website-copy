import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import { uploadPhotoToCloudinary } from "@/lib/cloudinary";
import clientPromise from "@/lib/mongodb";
import { HOMEPAGE_CATEGORY_CARDS } from "@/lib/categories";

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

function allowedCategory(slug) {
  return HOMEPAGE_CATEGORY_CARDS.find((category) => category.slug === slug) ?? null;
}

export async function GET() {
  const client = await clientPromise;
  const records = await client.db().collection("category_images").find({}).toArray();

  return NextResponse.json({
    categories: records
      .map((record) => ({
        slug: String(record.slug ?? "").trim(),
        title: String(record.title ?? "").trim(),
        image: String(record.image ?? "").trim(),
        updatedAt: record.updatedAt ?? null,
      }))
      .filter((record) => record.slug),
  });
}

export async function POST(request) {
  try {
    const guard = await requireAdmin();

    if (guard.error) {
      return guard.error;
    }

    const formData = await request.formData();
    const slug = normalizeSlug(formData.get("slug"));
    const title = String(formData.get("title") ?? "").trim();
    const photo = String(formData.get("photo") ?? "").trim();

    if (!slug) {
      return NextResponse.json({ message: "Category slug is required." }, { status: 400 });
    }

    const category = allowedCategory(slug);

    if (!category) {
      return NextResponse.json({ message: "Unknown category." }, { status: 400 });
    }

    if (!photo) {
      return NextResponse.json({ message: "Please choose a category image." }, { status: 400 });
    }

    const uploadedImage = await uploadPhotoToCloudinary(photo);
    const client = await clientPromise;
    const collection = client.db().collection("category_images");
    const now = new Date();

    await collection.updateOne(
      { slug },
      {
        $set: {
          slug,
          title: title || category.title,
          image: uploadedImage,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      message: "Category image updated successfully.",
      category: {
        slug,
        title: title || category.title,
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
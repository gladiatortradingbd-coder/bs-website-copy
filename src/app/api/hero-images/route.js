import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import { uploadPhotoToCloudinary } from "@/lib/cloudinary";
import clientPromise from "@/lib/mongodb";

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

export async function GET() {
  try {
    const client = await clientPromise;
    const record = await client.db().collection("hero_images").findOne({ key: "homepage" });

    return NextResponse.json({
      images: Array.isArray(record?.images) ? record.images : [],
      updatedAt: record?.updatedAt ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not load hero images." },
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
    const photos = formData
      .getAll("photos")
      .map((photo) => String(photo).trim())
      .filter(Boolean);

    if (!photos.length) {
      return NextResponse.json({ message: "Choose at least one hero image." }, { status: 400 });
    }

    if (photos.length > 8) {
      return NextResponse.json({ message: "You can select up to 8 hero images." }, { status: 400 });
    }

    const images = [];
    for (const photo of photos) {
      images.push(await uploadPhotoToCloudinary(photo));
    }

    const client = await clientPromise;
    const now = new Date();
    await client.db().collection("hero_images").updateOne(
      { key: "homepage" },
      {
        $set: { key: "homepage", images, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    revalidatePath("/", "page");

    return NextResponse.json({ message: "Hero images updated successfully.", images, updatedAt: now });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update hero images." },
      { status: 500 },
    );
  }
}

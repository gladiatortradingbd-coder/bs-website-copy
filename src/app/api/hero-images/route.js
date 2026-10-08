import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import { deletePhotoFromCloudinary, uploadPhotoToCloudinary } from "@/lib/cloudinary";
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
    let existingImages = [];
    try {
      const parsedImages = JSON.parse(String(formData.get("existingImages") ?? "[]"));
      existingImages = Array.isArray(parsedImages)
        ? parsedImages.filter((image) => typeof image === "string" && image.trim())
        : [];
    } catch {
      return NextResponse.json({ message: "The existing hero image list is invalid." }, { status: 400 });
    }

    const photos = formData
      .getAll("photos")
      .filter((photo) => typeof photo === "string" || (photo && typeof photo.arrayBuffer === "function"));

    if (!existingImages.length && !photos.length) {
      return NextResponse.json({ message: "Choose at least one hero image." }, { status: 400 });
    }

    if (existingImages.length + photos.length > 8) {
      return NextResponse.json({ message: "You can select up to 8 hero images." }, { status: 400 });
    }

    const images = [...existingImages];
    for (const photo of photos) {
      images.push(await uploadPhotoToCloudinary(photo));
    }

    const client = await clientPromise;
    const collection = client.db().collection("hero_images");
    const existingRecord = await collection.findOne({ key: "homepage" });
    const previousImages = Array.isArray(existingRecord?.images) ? existingRecord.images : [];
    const now = new Date();
    await collection.updateOne(
      { key: "homepage" },
      {
        $set: { key: "homepage", images, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    revalidatePath("/", "page");

    const replacedImages = previousImages.filter((image) => !images.includes(image));
    const deletionResults = await Promise.all(replacedImages.map((image) => deletePhotoFromCloudinary(image)));
    if (deletionResults.some((deleted, index) => !deleted && replacedImages[index]?.includes("cloudinary.com"))) {
      return NextResponse.json(
        { message: "Hero images were updated, but one or more old Cloudinary images could not be deleted. Check the Cloudinary API credentials." },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: "Hero images updated successfully.", images, updatedAt: now });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update hero images." },
      { status: 500 },
    );
  }
}

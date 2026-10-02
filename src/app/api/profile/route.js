import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import clientPromise from "@/lib/mongodb";

function buildProfileUpdate(payload) {
  const updates = {};
  const fields = ["name", "fullName", "phone", "region", "address", "city", "postalCode", "theme"];

  for (const field of fields) {
    if (typeof payload[field] === "string") {
      const value = payload[field].trim();
      if (value) {
        updates[field] = value;
      }
    }
  }

  if (updates.fullName && !updates.name) {
    updates.name = updates.fullName;
  }

  if (updates.name && !updates.fullName) {
    updates.fullName = updates.name;
  }

  return updates;
}

function toUserDocument(user) {
  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    name: user.name ?? "",
    fullName: user.fullName ?? user.name ?? "",
    email: user.email ?? "",
    role: user.role ?? "user",
    image: user.image ?? null,
    theme: user.theme ?? "white",
    phone: user.phone ?? "",
    region: user.region ?? "",
    address: user.address ?? "",
    city: user.city ?? "",
    postalCode: user.postalCode ?? "",
  };
}

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const user = await client
    .db()
    .collection("users")
    .findOne({ _id: new ObjectId(session.user.id) });

  return NextResponse.json({ user: toUserDocument(user) });
}

export async function PATCH(request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const updates = buildProfileUpdate(payload);

    if (!Object.keys(updates).length) {
      return NextResponse.json({ message: "No valid fields provided." }, { status: 400 });
    }

    updates.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updates },
    );

    const updatedUser = await users.findOne({ _id: new ObjectId(session.user.id) });

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: toUserDocument(updatedUser),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update profile." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new ObjectId(session.user.id);
    const client = await clientPromise;
    const db = client.db();

    await Promise.all([
      db.collection("users").deleteOne({ _id: userId }),
      db.collection("accounts").deleteMany({ userId: session.user.id }),
      db.collection("sessions").deleteMany({ userId: session.user.id }),
    ]);

    return NextResponse.json({ message: "Account deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not delete account." },
      { status: 500 },
    );
  }
}

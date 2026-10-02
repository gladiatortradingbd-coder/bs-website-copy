import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const payload = await request.json();
    const name = String(payload.name ?? "").trim();
    const email = String(payload.email ?? "").trim().toLowerCase();
    const password = String(payload.password ?? "");

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { message: "Name, email, and a 6+ character password are required." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    await users.createIndex({ email: 1 }, { unique: true });

    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await users.insertOne({
      name,
      fullName: name,
      email,
      password: passwordHash,
      emailVerified: null,
      role: "user",
      image: null,
      theme: "white",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong." },
      { status: 500 },
    );
  }
}

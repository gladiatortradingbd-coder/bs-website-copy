import { getServerSession } from "next-auth/next";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

async function syncStoredRole(email, fallbackRole = "user") {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  if (!normalizedEmail) {
    return fallbackRole;
  }

  const client = await clientPromise;
  const users = client.db().collection("users");
  const storedUser = await users.findOne(
    { email: normalizedEmail },
    { projection: { role: 1 } },
  );

  if (!storedUser) {
    return fallbackRole;
  }

  if (!storedUser.role) {
    await users.updateOne(
      { email: normalizedEmail, role: { $in: [null, ""] } },
      { $set: { role: fallbackRole, updatedAt: new Date() } },
    );

    return fallbackRole;
  }

  return storedUser.role;
}

function normalizeUser(user) {
  return {
    id: String(user._id ?? user.id),
    name: user.name ?? user.fullName ?? "",
    email: user.email ?? "",
    emailVerified: user.emailVerified ?? null,
    role: user.role ?? "user",
    image: user.image ?? null,
    theme: user.theme ?? "white",
    fullName: user.fullName ?? user.name ?? "",
    phone: user.phone ?? "",
    region: user.region ?? "",
    address: user.address ?? "",
    city: user.city ?? "",
    postalCode: user.postalCode ?? "",
  };
}

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const client = await clientPromise;
        const user = await client
          .db()
          .collection("users")
          .findOne({ email });

        if (!user?.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return normalizeUser(user);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.id;
        token.image = user.image ?? token.image ?? null;
        token.name = user.name ?? token.name ?? "";
        token.email = user.email ?? token.email ?? "";
        token.emailVerified = user.emailVerified ?? token.emailVerified ?? null;
        token.role = user.role ?? token.role ?? "user";
        token.theme = user.theme ?? token.theme ?? "white";
        token.fullName = user.fullName ?? user.name ?? token.fullName ?? "";
        token.phone = user.phone ?? token.phone ?? "";
        token.region = user.region ?? token.region ?? "";
        token.address = user.address ?? token.address ?? "";
        token.city = user.city ?? token.city ?? "";
        token.postalCode = user.postalCode ?? token.postalCode ?? "";
      }

      if (token.email) {
        const client = await clientPromise;
        const storedUser = await client.db().collection("users").findOne(
          { email: String(token.email).toLowerCase() },
          { projection: { role: 1, emailVerified: 1 } },
        );

        if (storedUser) {
          token.role = (await syncStoredRole(token.email, token.role ?? "user")) ?? token.role ?? "user";
          token.emailVerified = storedUser.emailVerified ?? token.emailVerified ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.image = token.image ?? session.user.image ?? null;
        session.user.name = token.name ?? session.user.name ?? "";
        session.user.email = token.email ?? session.user.email ?? "";
        session.user.emailVerified = token.emailVerified ?? null;
        session.user.role = token.role ?? "user";
        session.user.theme = token.theme ?? "white";
        session.user.fullName = token.fullName ?? token.name ?? "";
        session.user.phone = token.phone ?? "";
        session.user.region = token.region ?? "";
        session.user.address = token.address ?? "";
        session.user.city = token.city ?? "";
        session.user.postalCode = token.postalCode ?? "";
      }

      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/auth";
import AdminTabs from "@/components/admin/AdminTabs";
import { getAllBlogPosts } from "@/lib/blog";
import clientPromise from "@/lib/mongodb";

async function getProducts() {
  try {
    const client = await clientPromise;
    const products = await client
      .db()
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return products.map((product) => {
      const stockValue = Number(product.stock);
      const weightValue = Number(product.weight);

      return {
        id: String(product._id),
        title: product.title ?? "",
        category: product.category ?? "",
        price: product.price ?? "",
        photos: Array.isArray(product.photos) ? product.photos : [],
        description: product.description ?? "",
        colors: Array.isArray(product.colors) ? product.colors : [],
        stock: Number.isFinite(stockValue) ? stockValue : null,
        weight: Number.isFinite(weightValue) && weightValue > 0 ? weightValue : null,
        bestSelling: Boolean(product.bestSelling),
        newArrival: Boolean(product.newArrival),
      };
    });
  } catch (error) {
    return [];
  }
}

async function getBlogPosts() {
  try {
    return await getAllBlogPosts();
  } catch (error) {
    return [];
  }
}

async function getOrders() {
  try {
    const client = await clientPromise;
    const orders = await client
      .db()
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return orders.map((order) => ({
      id: String(order._id),
      items: Array.isArray(order.items) ? order.items : [],
      total: Number(order.total) || 0,
      paymentMethod: order.paymentMethod ?? "",
      status: order.status ?? "pending",
      customer: order.customer ?? {},
      createdAt: order.createdAt ?? null,
    }));
  } catch (error) {
    return [];
  }
}

export default async function AdminPage() {
  const session = await getAuthSession();
  const products = session?.user?.role === "admin" ? await getProducts() : [];
  const blogPosts = session?.user?.role === "admin" ? await getBlogPosts() : [];
  const orders = session?.user?.role === "admin" ? await getOrders() : [];

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/profile");
  }

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(60%_60%_at_12%_0%,#ecfdf3_0%,#ffffff_55%)] dark:bg-[radial-gradient(60%_60%_at_12%_0%,#0a1f14_0%,#0c0f0d_55%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl space-y-6 font-body">
        <section className="relative overflow-hidden rounded-[32px] border border-border-color/70 bg-background/85 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-emerald-100/70 dark:bg-emerald-900/30 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-amber-100/70 dark:bg-amber-900/30 blur-2xl" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Admin workspace</p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl font-display">
              Admin panel
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              This area is restricted to administrators. Add and manage store products, customers, inventory, analytics, blog posts, and homepage content from here.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/profile"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border-color bg-background px-5 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-black dark:hover:border-white hover:shadow-lg"
              >
                Back to profile
              </Link>
              <span className="text-xs text-muted-foreground">Signed in as admin</span>
            </div>
          </div>
        </section>

        <div className="rounded-[32px] border border-border-color/70 bg-background/80 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <AdminTabs initialProducts={products} initialBlogPosts={blogPosts} initialOrders={orders} />
        </div>
      </div>
    </main>
  );
}

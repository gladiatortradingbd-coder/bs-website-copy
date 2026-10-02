import { Suspense } from "react";
import ShopClient from "./ShopClient";

export default function ShopPage() {
  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-4xl border border-border-color bg-background p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-8 lg:p-10">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Shop</p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">All products</h1>
          </div>

          <Suspense fallback={null}>
            <ShopClient />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

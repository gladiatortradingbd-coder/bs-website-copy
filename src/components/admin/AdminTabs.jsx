"use client";

import { useState } from "react";
import AdminProductsPanel from "./AdminProductsPanel";
import InventoryPanel from "./InventoryPanel";
import AnalyticsPanel from "./AnalyticsPanel";
import CustomersPanel from "./CustomersPanel";
import AdminOrdersPanel from "./AdminOrdersPanel";
import CategoryImagesPanel from "./CategoryImagesPanel";
import HeroImagesPanel from "./HeroImagesPanel";
import AdminBlogPanel from "./AdminBlogPanel";
import Button from "@/components/ui/Button";

const TAB_META = {
  products: {
    title: "Products",
    description: "Add and manage store products from here.",
  },
  analytics: {
    title: "Analytics",
    description: "Review delivered sales and revenue performance.",
  },
  customers: {
    title: "Customers",
    description: "Store customer contact details and identify your most important buyers.",
  },
  inventory: {
    title: "Inventory",
    description: "Check stock totals, low-stock items, and product counts.",
  },
  orders: {
    title: "Orders",
    description: "Review and manage incoming orders.",
  },
  category: {
    title: "Category images",
    description: "Update homepage category visuals.",
  },
  hero: {
    title: "Hero images",
    description: "Choose and order the homepage hero rotation.",
  },
  blog: {
    title: "Blog posts",
    description: "Write and publish SEO-friendly blog articles.",
  },
};

export default function AdminTabs({ initialProducts, initialBlogPosts, initialOrders }) {
  const [tab, setTab] = useState("products");
  const activeTab = TAB_META[tab] ?? TAB_META.products;
  const tabs = [
    { id: "products", label: "Products" },
    { id: "analytics", label: "Analytics" },
    { id: "customers", label: "Customers" },
    { id: "inventory", label: "Inventory" },
    { id: "orders", label: "Orders" },
    { id: "category", label: "Category" },
    { id: "hero", label: "Hero" },
    { id: "blog", label: "Blog" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border-color/70 bg-background/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Control center</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground font-display sm:text-3xl">
              {activeTab.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">{activeTab.description}</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto rounded-full border border-border-color/70 bg-background/90 p-2 shadow-sm">
            {tabs.map((tabItem) => (
              <Button
                key={tabItem.id}
                type="button"
                variant={tab === tabItem.id ? "primary" : "ghost"}
                size="sm"
                className={`min-w-max rounded-full px-4 ${
                  tab === tabItem.id
                    ? "shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setTab(tabItem.id)}
              >
                {tabItem.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-border-color/70 bg-background/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
        {tab === "products" ? (
          <AdminProductsPanel initialProducts={initialProducts} />
        ) : tab === "analytics" ? (
          <AnalyticsPanel initialOrders={initialOrders} />
        ) : tab === "customers" ? (
          <CustomersPanel initialOrders={initialOrders} />
        ) : tab === "inventory" ? (
          <InventoryPanel initialProducts={initialProducts} />
        ) : tab === "orders" ? (
          <AdminOrdersPanel />
        ) : tab === "blog" ? (
          <AdminBlogPanel initialPosts={initialBlogPosts} />
        ) : tab === "hero" ? (
          <HeroImagesPanel />
        ) : (
          <CategoryImagesPanel />
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import clientPromise from "@/lib/mongodb";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import ProductCard from "@/components/ui/ProductCard";
import MobileProductCarousel from "@/components/ui/MobileProductCarousel";
import SearchBar from "@/components/ui/SearchBar";

const products = [
    {
        id: 1,
        name: "Pink Princess",
        category: "Banarasi Sarees",
        price: "Tk 34",
        image:
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 2,
        name: "Golden Barrel",
        category: "Cotton Sarees",
        price: "Tk 18",
        image:
            "https://images.unsplash.com/photo-1459156212016-c812468e2115?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 3,
        name: "Calathea Orbifolia",
        category: "Jamdani Sarees",
        price: "Tk 28",
        image:
            "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 4,
        name: "Mini Bonsai",
        category: "Silk Sarees",
        price: "Tk 42",
        image:
            "https://images.unsplash.com/photo-1512428813834-c702c7702b78?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 5,
        name: "White Orchid",
        category: "Tant Sarees",
        price: "Tk 26",
        image:
            "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 6,
        name: "Printed Cotton Saree",
        category: "Cotton Sarees",
        price: "Tk 16",
        image:
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 7,
        name: "Lightweight Silk Saree",
        category: "Silk Sarees",
        price: "Tk 22",
        image:
            "https://images.unsplash.com/photo-1463154545680-d59320fd685d?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 8,
        name: "Peace Lily",
        category: "Banarasi Sarees",
        price: "Tk 19",
        image:
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop",
    },
];

function getProductHref(id) {
    return typeof id === "string" && /^[a-f\d]{24}$/i.test(id) ? `/shop/${id}` : "/shop";
}

async function getNewArrivalProducts() {
    try {
        const client = await clientPromise;
        const products = await client
            .db()
            .collection("products")
            .find(
                { newArrival: true },
                { projection: { title: 1, price: 1, photos: 1, image: 1 } }
            )
            .sort({ createdAt: -1 })
            .toArray();

        return products.map((product) => ({
            id: String(product._id),
            name: product.title ?? "Untitled product",
            price: product.price ?? "",
            image: Array.isArray(product.photos) && product.photos[0] ? product.photos[0] : products[0]?.image,
        }));
    } catch (error) {
        return [];
    }
}

export default async function NewArrivals() {
        const featuredProducts = await getNewArrivalProducts();
        const displayedProducts = featuredProducts.length > 0 ? featuredProducts : products;

    return (
        <section className="bg-muted px-4 py-14 md:px-6 md:py-20 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* TOP SECTION */}
                <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">

                    {/* LEFT */}
                    <FadeIn direction="up">
                    <div>
                        <div
                            className="
                    mb-2
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-border-color
                bg-background
                px-3
                py-1.5
                text-[10px]
                font-medium
                text-foreground
                                md:mb-5
                md:px-4
                md:py-2
                md:text-sm
              "
                        >
                            <Sparkles size={15} />
                            Just Arrived
                        </div>

                        <h2 className="max-w-[18rem] text-[1.05rem] font-semibold leading-tight text-foreground sm:max-w-md sm:text-2xl md:max-w-2xl md:text-5xl">
                            Fresh arrivals for the modern saree wardrobe
                        </h2>
                    </div>
                    </FadeIn>

                    {/* RIGHT */}
                    <nav className="hidden flex-col gap-3 md:flex md:flex-row" aria-label="New arrivals filters">

                        {/* SEARCH */}
                        <Suspense fallback={null}>
                                <SearchBar
                                placeholder="Search new arrivals..."
                                className="w-full md:w-65"
                                submitHref="/shop"
                                filterHref="/shop"
                                />
                        </Suspense>

                        {/* CATEGORY */}
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-11 justify-between gap-6 rounded-xl px-4 text-xs hover:border-foreground md:h-14 md:gap-10 md:rounded-2xl md:px-5 md:text-sm"
                        >
                            <span>New arrivals</span>

                            <ChevronDown
                                size={18}
                                className="text-muted-foreground"
                            />
                        </Button>
                    </nav>
                </header>

                {/* MOBILE PRODUCTS */}
                <MobileProductCarousel products={displayedProducts} />

                {/* PRODUCT GRID */}
                                <ul
                                        className="
                        mt-14
                        hidden
                        grid-cols-1
                        gap-6
                        sm:grid
                        sm:grid-cols-2
                        lg:grid-cols-4
                    "
                                        aria-label="New arrival products"
                                >
                    {displayedProducts.map((product) => (
                        <li key={product.id}>
                            <ProductCard
                                href={getProductHref(product.id)}
                                name={product.name}
                                price={product.price}
                                image={product.image}
                                wishlistItem={{
                                    key: `new-arrivals-${product.id}`,
                                    id: product.id,
                                    cartItem: null,
                                }}
                            />
                        </li>
                    ))}
                </ul>

                {/* BUTTONS */}
                <nav className="mt-14 flex flex-col gap-4 sm:flex-row" aria-label="New arrivals actions">

                    <Link
                        href="/shop?newArrival=1"
                        className="
              btn-shimmer
              inline-flex
              h-14
              items-center
              justify-center
              rounded-2xl
              bg-foreground
              px-8
              text-sm
              font-medium
              text-background
              transition-all
              duration-300
              hover:scale-[1.02]
            "
                    >
                        Shop new arrivals
                    </Link>

                    <Link
                        href="/shop"
                        className="
              inline-flex
              h-14
              items-center
              justify-center
              rounded-2xl
              border
              border-neutral-300
              bg-background
              px-8
              text-sm
              font-medium
              text-foreground
              transition-all
              duration-300
              hover:border-foreground
            "
                    >
                        Browse collection
                    </Link>
                </nav>
            </div>
        </section>
    );
}
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const WishlistContext = createContext(null);

const STORAGE_KEY = "succulent-hut-wishlists";
const LEGACY_STORAGE_KEY = "succulent-hut-wishlist";

function sanitizeList(value) {
  return Array.isArray(value) ? value : [];
}

function sanitizeMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value).map(([key, list]) => [key, sanitizeList(list)]);
  return Object.fromEntries(entries);
}

function readStoredWishlists() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return sanitizeMap(parsed);
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) {
      return {};
    }

    const legacyParsed = JSON.parse(legacyRaw);
    const migrated = { guest: sanitizeList(legacyParsed) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migrated;
  } catch (error) {
    return {};
  }
}

function normalizeItem(item) {
  if (!item) {
    return null;
  }

  const key = String(item.key ?? item.id ?? item.href ?? item.name ?? item.title ?? "").trim();

  if (!key) {
    return null;
  }

  return {
    key,
    id: item.id ?? null,
    name: String(item.name ?? item.title ?? "").trim(),
    price: item.price ?? "",
    image: item.image ?? item.photo ?? "",
    href: item.href ?? "/shop",
    category: item.category ?? "",
    cartItem: item.cartItem ?? null,
  };
}

export function WishlistProvider({ children }) {
  const scope = "guest";

  const [wishlistsByScope, setWishlistsByScope] = useState(() => readStoredWishlists());
  const items = useMemo(() => wishlistsByScope[scope] ?? [], [wishlistsByScope, scope]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistsByScope));
    } catch (error) {
      // Ignore storage failures so wishlist remains usable in private mode.
    }
  }, [wishlistsByScope]);

  const api = useMemo(() => {
    const hasItem = (key) => items.some((item) => item.key === String(key));

    const addItem = (item) => {
      const normalizedItem = normalizeItem(item);

      if (!normalizedItem) {
        return;
      }

      setWishlistsByScope((currentMap) => {
        const currentItems = currentMap[scope] ?? [];

        if (currentItems.some((currentItem) => currentItem.key === normalizedItem.key)) {
          return currentMap;
        }

        return {
          ...currentMap,
          [scope]: [normalizedItem, ...currentItems],
        };
      });
    };

    const removeItem = (key) => {
      const resolvedKey = String(key);

      setWishlistsByScope((currentMap) => {
        const currentItems = currentMap[scope] ?? [];

        return {
          ...currentMap,
          [scope]: currentItems.filter((item) => item.key !== resolvedKey),
        };
      });
    };

    const toggleItem = (item) => {
      const normalizedItem = normalizeItem(item);

      if (!normalizedItem) {
        return;
      }

      setWishlistsByScope((currentMap) => {
        const currentItems = currentMap[scope] ?? [];

        if (currentItems.some((currentItem) => currentItem.key === normalizedItem.key)) {
          return {
            ...currentMap,
            [scope]: currentItems.filter((currentItem) => currentItem.key !== normalizedItem.key),
          };
        }

        return {
          ...currentMap,
          [scope]: [normalizedItem, ...currentItems],
        };
      });
    };

    const clearWishlist = () => {
      setWishlistsByScope((currentMap) => ({
        ...currentMap,
        [scope]: [],
      }));
    };

    return {
      items,
      count: items.length,
      hasItem,
      addItem,
      removeItem,
      toggleItem,
      clearWishlist,
    };
  }, [items, scope]);

  return <WishlistContext.Provider value={api}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}

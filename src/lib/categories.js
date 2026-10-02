const CATEGORY_ALIASES = {
  all: {
    title: "All",
    href: "/shop",
    aliases: [],
  },
  plants: {
    title: "Plants",
    href: "/shop?category=plants",
    aliases: ["Plants"],
  },
  soil: {
    title: "Media",
    href: "/shop?category=soil",
    aliases: ["Media", "Media (Soil)", "Soil"],
  },
  planters: {
    title: "Planters",
    href: "/shop?category=planters",
    aliases: ["Planters"],
  },
  "garden-accessories": {
    title: "Garden Accessories",
    href: "/shop?category=garden-accessories",
    aliases: ["Garden Accessories"],
  },
  "air-plant-holders": {
    title: "Air Plant Holders",
    href: "/shop?category=air-plant-holders",
    aliases: ["Air Plant Holders"],
  },
};

export const HOMEPAGE_CATEGORY_CARDS = [
  {
    slug: "plants",
    title: "Plants",
    href: "/shop?category=plants",
    image: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243572/shrubs_sssy3v.jpg",
  },
  {
    slug: "soil",
    title: "Media",
    href: "/shop?category=soil",
    image: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/cacti_jayknk.jpg",
  },
  {
    slug: "planters",
    title: "Planters",
    href: "/shop?category=planters",
    image: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/herbs_lwlidn.jpg",
  },
  {
    slug: "garden-accessories",
    title: "Garden Accessories",
    href: "/shop?category=garden-accessories",
    image: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/bamboo_nl0mwr.jpg",
  },
  {
    slug: "air-plant-holders",
    title: "Air Plant Holders",
    href: "/shop?category=air-plant-holders",
    image: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/orchids_fubtjf.jpg",
  },
];

export const MOBILE_CATEGORY_CHIPS = [
  { slug: "all", ...CATEGORY_ALIASES.all },
  { slug: "plants", ...CATEGORY_ALIASES.plants },
  { slug: "soil", ...CATEGORY_ALIASES.soil },
  { slug: "planters", ...CATEGORY_ALIASES.planters },
  { slug: "garden-accessories", ...CATEGORY_ALIASES["garden-accessories"] },
  { slug: "air-plant-holders", ...CATEGORY_ALIASES["air-plant-holders"] },
];

function normalizeCategoryValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryMatches(value, candidate) {
  return normalizeCategoryValue(value) === normalizeCategoryValue(candidate);
}

export function getCategoryLink(slug) {
  const category = CATEGORY_ALIASES[slug];

  return category?.href ?? "/shop";
}

export function getCategoryFilterValues(categoryParam) {
  const normalizedParam = normalizeCategoryValue(categoryParam);

  if (!normalizedParam || normalizedParam === "all") {
    return [];
  }

  for (const category of Object.values(CATEGORY_ALIASES)) {
    const candidates = [category.title, ...category.aliases];

    if (categoryMatches(normalizedParam, category.title) || candidates.some((candidate) => categoryMatches(normalizedParam, candidate))) {
      return [category.title, ...category.aliases].filter(Boolean);
    }
  }

  return [categoryParam];
}

export function getCategoryDisplayName(categoryParam) {
  const normalizedParam = normalizeCategoryValue(categoryParam);

  if (!normalizedParam || normalizedParam === "all") {
    return "All products";
  }

  for (const category of Object.values(CATEGORY_ALIASES)) {
    const candidates = [category.title, ...category.aliases];

    if (categoryMatches(normalizedParam, category.title) || candidates.some((candidate) => categoryMatches(normalizedParam, candidate))) {
      return category.title;
    }
  }

  return categoryParam;
}

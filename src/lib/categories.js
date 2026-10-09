const CATEGORY_ALIASES = {
  all: {
    title: "All",
    href: "/shop",
    aliases: [],
  },
  "banarasi-sarees": {
    title: "Banarasi Sarees",
    href: "/shop?category=banarasi-sarees",
    aliases: ["Banarasi Sarees", "Banarasi"],
  },
  "cotton-sarees": {
    title: "Cotton Sarees",
    href: "/shop?category=cotton-sarees",
    aliases: ["Cotton Sarees", "Cotton"],
  },
  "jamdani-sarees": {
    title: "Jamdani Sarees",
    href: "/shop?category=jamdani-sarees",
    aliases: ["Jamdani Sarees", "Jamdani"],
  },
  "silk-sarees": {
    title: "Silk Sarees",
    href: "/shop?category=silk-sarees",
    aliases: ["Silk Sarees", "Silk"],
  },
  "tant-sarees": {
    title: "Tant Sarees",
    href: "/shop?category=tant-sarees",
    aliases: ["Tant Sarees", "Tant"],
  },
};

export const HOMEPAGE_CATEGORY_CARDS = [
  {
    slug: "banarasi-sarees",
    title: "Banarasi Sarees",
    href: "/shop?category=banarasi-sarees",
    image: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243572/shrubs_sssy3v.jpg",
  },
  {
    slug: "cotton-sarees",
    title: "Cotton Sarees",
    href: "/shop?category=cotton-sarees",
    image: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/cacti_jayknk.jpg",
  },
  {
    slug: "jamdani-sarees",
    title: "Jamdani Sarees",
    href: "/shop?category=jamdani-sarees",
    image: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/herbs_lwlidn.jpg",
  },
  {
    slug: "silk-sarees",
    title: "Silk Sarees",
    href: "/shop?category=silk-sarees",
    image: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/bamboo_nl0mwr.jpg",
  },
  {
    slug: "tant-sarees",
    title: "Tant Sarees",
    href: "/shop?category=tant-sarees",
    image: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243570/orchids_fubtjf.jpg",
  },
];

export const MOBILE_CATEGORY_CHIPS = [
  { slug: "all", ...CATEGORY_ALIASES.all },
  { slug: "banarasi-sarees", ...CATEGORY_ALIASES["banarasi-sarees"] },
  { slug: "cotton-sarees", ...CATEGORY_ALIASES["cotton-sarees"] },
  { slug: "jamdani-sarees", ...CATEGORY_ALIASES["jamdani-sarees"] },
  { slug: "silk-sarees", ...CATEGORY_ALIASES["silk-sarees"] },
  { slug: "tant-sarees", ...CATEGORY_ALIASES["tant-sarees"] },
];

export function createCategorySlug(value) {
  return normalizeCategoryValue(value).replace(/\s+/g, "-");
}

export function getFallbackCategory(slug) {
  return HOMEPAGE_CATEGORY_CARDS.find((category) => category.slug === slug) ?? null;
}

export function getFallbackCategories() {
  return HOMEPAGE_CATEGORY_CARDS;
}

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

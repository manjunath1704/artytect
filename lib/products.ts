export type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  tags: string[];
  shortDescription: string;
  description: string;
  images: string[];
};

export const products: Product[] = [
  {
    id: "wood-fired-bowl",
    name: "Wood Fired Bowl",
    category: "Pottery",
    sku: "AT-001",
    price: 350,
    badge: "New",
    tags: ["gadgets", "minimalistic"],
    shortDescription:
      "A warm, sculptural bowl with a softly uneven rim and natural grain-like clay movement.",
    description:
      "Thrown slowly in small batches, this bowl brings a grounded presence to table settings, shelves, and everyday rituals. Its satin surface catches light gently while the rounded form keeps the piece easy to live with.",
    images: [
      "/images/bowl-a.avif",
      "/images/bowl-b.avif",
      "/images/deep-a.avif",
      "/images/deep-b.avif",
    ],
  },
  {
    id: "marine-plate",
    name: "Marine Plate",
    category: "Plates",
    sku: "AT-014",
    price: 250,
    badge: "New",
    tags: ["tableware", "matte"],
    shortDescription:
      "A calm blue plate with a shallow curve, designed for layered everyday dining.",
    description:
      "A simple dinner plate with a softened profile and cool-toned glaze. It works as a quiet anchor for breakfast, shared starters, or a thoughtfully plated supper.",
    images: ["/images/plate-a.avif", "/images/plate-b.avif", "/images/deep-a.avif"],
  },
  {
    id: "textured-mug",
    name: "Textured Mug",
    category: "Mugs",
    sku: "AT-022",
    price: 85,
    tags: ["coffee", "handmade"],
    shortDescription:
      "A tactile mug with a comfortable handle and natural studio finish.",
    description:
      "Made for slow mornings, this mug pairs a balanced silhouette with a surface that keeps the maker's touch visible. Each piece has subtle variation in tone and texture.",
    images: ["/images/mug-a.avif", "/images/mug-b.avif", "/images/gallery/pexels-rdne-8903648.jpg"],
  },
  {
    id: "quiet-vase",
    name: "Quiet Vase",
    category: "Vases",
    sku: "AT-031",
    price: 180,
    tags: ["decor", "minimal"],
    shortDescription:
      "A restrained vessel with a narrow neck, made for single stems or empty display.",
    description:
      "This vase is shaped to feel composed from every angle. The surface is lightly textured, allowing flowers, branches, or the bare form to hold attention without noise.",
    images: ["/images/vase-a.avif", "/images/vase-b.avif", "/images/gallery/pexels-jessejames-16691991.jpg"],
  },
  {
    id: "studio-planter",
    name: "Studio Planter",
    category: "Planters",
    sku: "AT-045",
    price: 140,
    badge: "New",
    tags: ["plants", "home"],
    shortDescription:
      "A grounded ceramic planter for herbs, trailing greens, and sunlit shelves.",
    description:
      "Balanced in proportion and easy to style, this planter gives greenery a simple ceramic base with enough texture to feel handmade.",
    images: ["/images/planter-a.avif", "/images/planter-b.avif", "/images/gallery/pexels-karola-g-6920401.jpg"],
  },
  {
    id: "deep-serving-plate",
    name: "Deep Serving Plate",
    category: "Deep Plates",
    sku: "AT-052",
    price: 120,
    compareAtPrice: 160,
    badge: "-15%",
    tags: ["serving", "hosting"],
    shortDescription:
      "A deeper ceramic plate for grains, salads, soups, and shared table moments.",
    description:
      "A generous serving form with a quiet curve and practical depth. It is substantial enough for hosting while still simple enough for daily use.",
    images: ["/images/deep-a.avif", "/images/deep-b.avif", "/images/plate-b.avif"],
  },
];

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function getRelatedProducts(productId: string) {
  return products.filter((product) => product.id !== productId).slice(0, 4);
}

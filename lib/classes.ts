export type PotteryClass = {
  slug: string;
  title: string;
  featured: boolean;
  price: number;
  duration: string;
  level: string;
  capacity: string;
  image: string;
  shortDescription: string;
  description: string;
  includes: string[];
};

export const potteryClasses: PotteryClass[] = [
  {
    slug: "wheel-throwing-basics",
    title: "Wheel Throwing Basics",
    featured: true,
    price: 2999,
    duration: "4 Weeks",
    level: "Beginner",
    capacity: "8 seats",
    image: "/images/gallery/pexels-rdne-8903303.jpg",
    shortDescription:
      "Learn centering, pulling, trimming, and glazing through calm weekly studio sessions.",
    description:
      "A grounded introduction to the wheel for first-time makers and returning hands. You will move from clay preparation to finished fired pieces with close guidance at every stage.",
    includes: ["Clay and firing", "Studio tools", "Two finished pieces", "Glazing session"],
  },
  {
    slug: "handbuilding-tableware",
    title: "Handbuilding Tableware",
    featured: true,
    price: 2499,
    duration: "3 Weeks",
    level: "All levels",
    capacity: "10 seats",
    image: "/images/gallery/pexels-readymade-3847467.jpg",
    shortDescription:
      "Shape plates, bowls, and serving forms with pinch, coil, and slab techniques.",
    description:
      "A tactile class for building useful tableware without the wheel. The pace is generous, the forms are functional, and every piece keeps the warmth of the maker's hand.",
    includes: ["Clay and firing", "Texture tools", "Three tableware forms", "Food-safe glazing"],
  },
  {
    slug: "ceramic-surface-workshop",
    title: "Ceramic Surface Workshop",
    featured: true,
    price: 1899,
    duration: "1 Day",
    level: "Intermediate",
    capacity: "12 seats",
    image: "/images/gallery/pexels-karola-g-6805523.jpg",
    shortDescription:
      "Explore slips, carving, wax resist, and layered glazes for expressive ceramic surfaces.",
    description:
      "A focused surface design workshop for people who already know basic clay handling and want to deepen the finish, texture, and visual language of their work.",
    includes: ["Practice tiles", "Surface materials", "Glaze testing", "Firing included"],
  },
];

export function getClass(slug: string) {
  return potteryClasses.find((classItem) => classItem.slug === slug);
}

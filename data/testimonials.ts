export type Testimonial = {
  id: number | string;
  name: string;
  location: string;
  image: string;
  imageAlt?: string;
  rating: number;
  purchased: string;
  review: string;
};

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ananya Sharma",
    location: "Bangalore",
    image: "/images/rating-user.jpg",
    rating: 5,
    purchased: "Wheel Throwing Workshop",
    review:
      "The pottery experience was incredibly calming and creative. The studio felt warm, patient, and beautifully intentional from the first minute.",
  },
  {
    id: 2,
    name: "Aarohi Mehta",
    location: "Mumbai",
    image: "/images/rating-user.jpg",
    rating: 5,
    purchased: "Textured Mug",
    review:
      "The mug feels handmade in the best way: balanced, warm, and quietly beautiful on my desk every morning.",
  },
  {
    id: 3,
    name: "Nikhil Rao",
    location: "Hyderabad",
    image: "/images/rating-user.jpg",
    rating: 5,
    purchased: "Studio Planter",
    review:
      "I ordered two planters over WhatsApp and the whole process felt personal. The pieces arrived exactly as shown and sit beautifully in my home.",
  },
  {
    id: 4,
    name: "Mira Thomas",
    location: "Kochi",
    image: "/images/rating-user.jpg",
    rating: 5,
    purchased: "Handbuilding Tableware",
    review:
      "The class was calm, clear, and generous. I left with pieces that felt personal, useful, and honestly better than I expected to make.",
  },
  {
    id: 5,
    name: "Kabir Sethi",
    location: "Delhi",
    image: "/images/rating-user.jpg",
    rating: 5,
    purchased: "Wood Fired Bowl",
    review:
      "The bowl has a quiet weight and finish that makes simple meals feel considered. It is the piece everyone reaches for first.",
  },
];

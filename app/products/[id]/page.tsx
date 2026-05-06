import Image from "next/image";
import { notFound } from "next/navigation";

const products = [
  {
    id: "clay-vase",
    name: "Handcrafted Clay Vase",
    price: "₹2,400",
    image: "/images/p1.jpg",
    description:
      "A minimal handcrafted vase with earthy tones and raw texture.",
  },
  {
    id: "ceramic-plate",
    name: "Ceramic Dinner Plate",
    price: "₹1,200",
    image: "/images/p2.jpg",
    description:
      "Elegant ceramic plate designed for everyday dining.",
  },
  {
    id: "textured-mug",
    name: "Textured Mug",
    price: "₹800",
    image: "/images/p3.jpg",
    description:
      "Rustic mug with hand-textured surface.",
  },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) return notFound();

  return (
    <section className="w-full px-6 md:px-16 py-16 bg-white text-black">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

        {/* IMAGE */}
        <div className="w-full h-[500px]">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>

        {/* CONTENT */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-serif">
            {product.name}
          </h1>

          <span className="text-xl text-neutral-700">
            {product.price}
          </span>

          <p className="text-neutral-600 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>
    </section>
  );
}

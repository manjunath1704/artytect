"use client";

import Link from "next/link";
import Image from "next/image";

const products = [
  {
    id: "clay-vase",
    name: "Handcrafted Clay Vase",
    price: "₹2,400",
    image: "/images/p1.jpg",
  },
  {
    id: "ceramic-plate",
    name: "Ceramic Dinner Plate",
    price: "₹1,200",
    image: "/images/p2.jpg",
  },
  {
    id: "textured-mug",
    name: "Textured Mug",
    price: "₹800",
    image: "/images/p3.jpg",
  },
];

export default function ShopPage() {
  return (
    <section className="w-full px-6 md:px-16 py-16 bg-white text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADING */}
        <h1 className="text-3xl md:text-5xl font-serif mb-12">
          Shop
        </h1>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              
              <div className="group cursor-pointer">
                <div className="w-full h-[320px] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <h2 className="text-lg">{product.name}</h2>
                  <span className="text-sm text-neutral-500">
                    {product.price}
                  </span>
                </div>
              </div>

            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
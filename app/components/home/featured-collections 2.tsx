const collections = [
  {
    title: "Mugs",
    description: "Everyday forms with soft handles and warm glazes for slow mornings.",
    accent: "from-[#d9c4b0] via-[#ede4d7] to-[#a56c4c]",
  },
  {
    title: "Bowls",
    description: "Low, balanced silhouettes that work beautifully for serving and display.",
    accent: "from-[#d8d7cd] via-[#f0ede4] to-[#8f9c83]",
  },
  {
    title: "Vases",
    description: "Tall statement pieces with clean necks and tactile surface variation.",
    accent: "from-[#e7d2b9] via-[#f4ede2] to-[#c28a61]",
  },
  {
    title: "Decor",
    description: "Quiet sculptural accents that bring texture to shelves and tabletops.",
    accent: "from-[#e3ddd2] via-[#f6f1e8] to-[#80725f]",
  },
];

const FeaturedCollections = () => {
  return (
    <section
      id="collections"
      className=" px-6 py-20 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between">
          {/* <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
            Featured collections
          </p> */}
          <h2 className="mt-4 max-w-2xl text-4xl font-display tracking-[-0.05em] text-[#1b1511] sm:text-5xl lg:text-6xl">
            {/* Categories shaped for everyday rituals and calm interiors. */} Categories
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#665b4f] sm:text-lg">
            Explore a concise selection of mugs, bowls, vases, and decor pieces designed
            with a restrained, earthy palette and a premium finish.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {collections.map((collection, index) => (
            <article
              key={collection.title}
              className="p-4 backdrop-blur-sm"
            >
              <div className="relative overflow-hidden bg-[#f3eadb] p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_36%)]" />
                <div className="absolute inset-x-6 bottom-4 h-8 rounded-full bg-black/10 blur-2xl" />

                <div className="relative flex aspect-[4/3] items-center justify-center">
                  <div
                    className={`h-28 w-28 rounded-[46%_46%_40%_40%] bg-gradient-to-b ${collection.accent}`}
                  />
                  <div className="absolute inset-x-[24%] bottom-[18%] h-8 rounded-full bg-black/10 blur-lg" />
                  <div className="absolute left-[18%] top-[24%] h-9 w-9 rounded-full bg-white/35 blur-[2px]" />
                </div>
              </div>

              <div className="space-y-3 px-1 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-display tracking-[-0.03em] text-[#1b1511]">
                    {collection.title}
                  </h3>
                  <span className="text-xs uppercase tracking-[0.3em] text-[#8a7765]">
                    0{index + 1}
                  </span>
                </div>
                <p className="text-sm leading-7 text-[#665b4f]">{collection.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;

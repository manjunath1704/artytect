"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MasonryPhotoAlbum } from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "react-photo-album/masonry.css";
import "yet-another-react-lightbox/styles.css";

const images = [
  {
    src: "/images/gallery/pexels-handanovijc-12859531.jpg",
    width: 1280,
    height: 1920,
    caption: "Clay vessel study",
  },
  {
    src: "/images/gallery/pexels-ivan-s-7119222.jpg",
    width: 1280,
    height: 853,
    caption: "Ceramic studio shelf",
  },
  {
    src: "/images/gallery/pexels-rdne-8903303.jpg",
    width: 1280,
    height: 1920,
    caption: "Pottery wheel process",
  },
  {
    src: "/images/gallery/pexels-karola-g-6805523.jpg",
    width: 1279,
    height: 853,
    caption: "Earth-toned ceramic forms",
  },
  {
    src: "/images/gallery/pexels-rdne-8903259.jpg",
    width: 1280,
    height: 1920,
    caption: "Hands shaping clay",
  },
  {
    src: "/images/gallery/pexels-karola-g-6920401.jpg",
    width: 1280,
    height: 853,
    caption: "Minimal ceramic display",
  },
  {
    src: "/images/gallery/pexels-karola-g-7588511.jpg",
    width: 1280,
    height: 1920,
    caption: "Wheel-thrown pottery",
  },
  {
    src: "/images/gallery/pexels-mart-production-8217302.jpg",
    width: 1279,
    height: 853,
    caption: "Handmade clay collection",
  },
  {
    src: "/images/gallery/pexels-photogbasya-a-1171505293-29665160.jpg",
    width: 1280,
    height: 1707,
    caption: "Handmade ceramic detail",
  },
  {
    src: "/images/gallery/pexels-rdne-8903648.jpg",
    width: 1280,
    height: 853,
    caption: "Ceramic studio table",
  },
  {
    src: "/images/gallery/pexels-jessejames-16691991.jpg",
    width: 1280,
    height: 2276,
    caption: "Tall studio vessel",
  },
  {
    src: "/images/gallery/pexels-readymade-3847457.jpg",
    width: 1280,
    height: 853,
    caption: "Finished clay pieces",
  },
  {
    src: "/images/gallery/pexels-makaroff-aleksandr-114409006-10401476.jpg",
    width: 1280,
    height: 1920,
    caption: "Glazed pottery detail",
  },
  {
    src: "/images/gallery/pexels-ron-lach-10222718.jpg",
    width: 1280,
    height: 853,
    caption: "Artisan ceramic workspace",
  },
  {
    src: "/images/gallery/pexels-picdrow-10995878.jpg",
    width: 1280,
    height: 1920,
    caption: "Clay vessel texture",
  },
  {
    src: "/images/gallery/pexels-stephanie-loewe-23778814-6842672.jpg",
    width: 1280,
    height: 853,
    caption: "Stacked ceramic forms",
  },
  {
    src: "/images/gallery/pexels-readymade-3847467.jpg",
    width: 1280,
    height: 1619,
    caption: "Clay work in progress",
  },
  {
    src: "/images/gallery/pexels-readymade-3847438.jpg",
    width: 1280,
    height: 853,
    caption: "Earthware collection",
  },
  {
    src: "/images/gallery/pexels-ramon-clemente-1097299-6546576.jpg",
    width: 1280,
    height: 1920,
    caption: "Ceramic finishing process",
  },
];

export default function GalleryApp() {
  const [index, setIndex] = useState<number>(-1);
  const isLightboxOpen = index >= 0;

  const showPrevious = () => {
    setIndex((currentIndex) =>
      currentIndex <= 0 ? images.length - 1 : currentIndex - 1
    );
  };

  const showNext = () => {
    setIndex((currentIndex) =>
      currentIndex >= images.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <section id="gallery" className="bg-[#fcfdfa] px-6 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-2xl text-4xl font-display tracking-[-0.05em] text-[#1b1511] sm:text-5xl lg:text-6xl">
            Gallery
          </h2>
          <p className="max-w-xl text-base leading-8 text-[#665b4f] sm:text-lg">
            A closer look at the forms, glazes, and quiet surface details across the
            collection.
          </p>
        </div>

        <MasonryPhotoAlbum
          photos={images.map((img) => ({
            src: img.src,
            width: img.width,
            height: img.height,
            alt: img.caption,
            title: img.caption,
          }))}
          columns={(containerWidth) => {
            if (containerWidth < 640) return 1;
            if (containerWidth < 900) return 2;
            if (containerWidth < 1200) return 3;
            return 4;
          }}
          spacing={(containerWidth) => (containerWidth < 640 ? 14 : 20)}
          padding={0}
          sizes={{
            size: "25vw",
            sizes: [
              { viewport: "(max-width: 639px)", size: "calc(100vw - 48px)" },
              { viewport: "(max-width: 899px)", size: "calc((100vw - 64px) / 2)" },
              { viewport: "(max-width: 1199px)", size: "calc((100vw - 80px) / 3)" },
            ],
          }}
          componentsProps={{
            button: {
              className:
                "group overflow-hidden rounded-none bg-[#f4efe7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1b1511]",
            },
            image: {
              className:
                "h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105",
            },
          }}
          onClick={({ index }) => setIndex(index)}
        />
      </div>

      {/* 🔹 Lightbox */}
      <Lightbox
        open={isLightboxOpen}
        index={index}
        close={() => setIndex(-1)}
        on={{ view: ({ index: currentIndex }) => setIndex(currentIndex) }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
        slides={images.map((img) => ({
          src: img.src,
          title: img.caption,
        }))}
      />

      {isLightboxOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] flex">
          <button
            type="button"
            aria-label="Previous image"
            onClick={showPrevious}
            className="flex h-[25px] w-[25px] items-center justify-center rounded-none border border-white/70 bg-transparent text-white shadow-[0_16px_32px_rgba(0,0,0,0.32)] backdrop-blur-sm transition hover:bg-white hover:text-black"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={showNext}
            className="flex h-[25px] w-[25px] items-center justify-center rounded-none border border-l-0 border-white/70 bg-transparent text-white shadow-[0_16px_32px_rgba(0,0,0,0.32)] backdrop-blur-sm transition hover:bg-white hover:text-black"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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

type ProcessCard =
  | {
      type: "video";
      src: string;
      poster: string;
      title: string;
      caption: string;
    }
  | {
      type: "image";
      src: string;
      index: number;
      title: string;
      caption: string;
    };

const processCards: ProcessCard[] = [
  {
    type: "video",
    src: "/videos/hero-video.mp4",
    poster: "/images/gallery/pexels-rdne-8903303.jpg",
    title: "Wheel throwing rhythm",
    caption: "Clay centered by hand, turning slowly into everyday form.",
  },
  {
    type: "image",
    src: images[4].src,
    index: 4,
    title: "Hands shaping clay",
    caption: "Quiet pressure, patient movement, and the first gesture of a vessel.",
  },
  {
    type: "image",
    src: images[11].src,
    index: 11,
    title: "Finished clay pieces",
    caption: "Earthware forms gathered after firing, ready for daily rituals.",
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
    <section
      id="gallery"
      className="relative overflow-hidden bg-[#f4efe6] py-20 text-[#1b1511] md:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(185,130,94,0.16),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(154,107,78,0.1),transparent_32%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:repeating-linear-gradient(0deg,rgba(27,21,17,0.28)_0px,rgba(27,21,17,0.28)_1px,transparent_1px,transparent_5px)]" />

      <div className="site-container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mb-12 grid gap-6 border-b border-[#d8cabd] pb-8 md:grid-cols-[0.82fr_1fr] md:items-end"
        >
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a6b4e]">
              <Sparkles className="h-4 w-4" />
              Crafted moments
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-display uppercase leading-none tracking-normal text-[#1b1511] sm:text-5xl lg:text-6xl">
              Inside Our Pottery Studio
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#665b4f] md:justify-self-end">
            A cinematic glimpse into the artistry, craftsmanship, and soulful
            process behind every handmade ceramic piece.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.9fr]">
          <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="relative min-h-[420px] overflow-hidden border border-[#d8cabd] bg-[#17110d] lg:min-h-[640px]"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/gallery/pexels-rdne-8903303.jpg"
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden="true"
            >
              <source src="/videos/hero-video-b.mp4" type="video/mp4" />
              <source src="/videos/hero.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,17,13,0.12),rgba(23,17,13,0.18)_42%,rgba(23,17,13,0.72))]" />
            <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center border border-white/35 bg-white/12 text-white backdrop-blur-md">
              <Play className="h-4 w-4" fill="currentColor" />
            </div>
            <div className="absolute inset-x-5 bottom-5 text-white md:inset-x-7 md:bottom-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#ead7c3]">
                Featured process
              </p>
              <h3 className="mt-3 max-w-xl text-4xl font-display uppercase leading-none tracking-normal md:text-5xl">
                Clay, water, pressure, and time
              </h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#f3e4d4]">
                Watch the quiet studio rhythm behind each thrown, glazed, and
                fired piece.
              </p>
            </div>
          </motion.article>

          <div className="grid gap-5">
            {processCards.map((item, itemIndex) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: itemIndex * 0.08, ease: "easeOut" }}
                className="relative min-h-[230px] overflow-hidden border border-[#d8cabd] bg-[#17110d]"
              >
                {item.type === "video" ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={item.poster}
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-hidden="true"
                  >
                    <source src={item.src} type="video/mp4" />
                  </video>
                ) : (
                  <button
                    type="button"
                    className="absolute inset-0 text-left"
                    onClick={() => setIndex(item.index)}
                    aria-label={`Open ${item.title}`}
                  >
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 35vw, calc(100vw - 48px)"
                      className="object-cover"
                    />
                  </button>
                )}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(23,17,13,0.08),rgba(23,17,13,0.70))]" />
                <div className="pointer-events-none absolute inset-x-5 bottom-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ead7c3]">
                    Studio study
                  </p>
                  <h3 className="mt-2 text-2xl font-display uppercase leading-none">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-[#f3e4d4]">
                    {item.caption}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <MasonryPhotoAlbum
            photos={images.map((img) => ({
              src: img.src,
              width: img.width,
              height: img.height,
              alt: img.caption,
              title: img.caption,
            }))}
            columns={(containerWidth) => {
              if (containerWidth < 480) return 1;
              if (containerWidth < 900) return 2;
              if (containerWidth < 1200) return 3;
              return 4;
            }}
            spacing={(containerWidth) => {
              if (containerWidth < 480) return 12;
              if (containerWidth < 900) return 14;
              return 20;
            }}
            padding={0}
            sizes={{
              size: "25vw",
              sizes: [
                { viewport: "(max-width: 479px)", size: "calc(100vw - 48px)" },
                { viewport: "(max-width: 899px)", size: "calc((100vw - 62px) / 2)" },
                { viewport: "(max-width: 1199px)", size: "calc((100vw - 80px) / 3)" },
              ],
            }}
            componentsProps={{
              button: {
                className:
                  "group overflow-hidden rounded-none border border-[#d8cabd] bg-[#f4efe7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1b1511]",
              },
              image: {
                className:
                  "h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-90",
              },
            }}
            onClick={({ index }) => setIndex(index)}
          />
        </div>
      </div>

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

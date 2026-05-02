import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-20 text-center sm:px-8 lg:px-10">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        {/* <source src="/videos/hero-a-mobile.mp4" type="video/mp4" media="(max-width: 767px)" /> */}
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,20,15,0.58),rgba(23,20,15,0.28),rgba(23,20,15,0.56))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(157,103,69,0.16),transparent_56%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center">
        {/* <p className="inline-flex border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#f8f2e8] backdrop-blur-md">
          Earthy handcrafted ceramics
        </p> */}

        <h1 className="mt-6 max-w-4xl text-4xl font-display sm:leading-[0.94] sm:tracking-[-0.05em] text-[#f8f2e8] sm:text-6xl">
          Quiet clay, warm light, and pieces that settle beautifully into daily life.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-[#f2e6d7] sm:text-lg lg:text-xl">
          Thoughtfully made pottery with soft shapes, natural tones, and a calm presence
          that lets the material speak for itself.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="rounded-none border border-[#f8f2e8]/20 bg-[#f8f2e8] px-7 py-4 text-base text-[#17140f] hover:bg-[#efe4d6]"
            asChild
          >
            <a href="#shop">Shop</a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-none border-white/25 bg-transparent px-7 py-4 text-base text-[#f8f2e8] hover:bg-white/10 hover:text-[#f8f2e8]"
            asChild
          >
            <a href="#gallery">View Gallery</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

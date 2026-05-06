import Navbar from "./components/home/navbar";
import Hero from "./components/home/hero";
import FeaturedCollections from "./components/home/featured-collections";
import AboutSection from "./components/home/about";
import TestimonialsSection from "./components/home/testimonials";
import CraftsmanshipProcess from "./components/home/craftsmanship-process";
import GalleryApp from "./components/home/gallery";
import Footer from "./components/home/footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedCollections />
        <AboutSection/>
        <CraftsmanshipProcess/>
        <TestimonialsSection/>
        <GalleryApp/>
      </main>
      <Footer />
    </>
  );
}

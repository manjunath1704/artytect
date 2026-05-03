import Navbar from "./components/home/navbar";
import Hero from "./components/home/hero";
import FeaturedCollections from "./components/home/featured-collections";
import AboutSection from "./components/home/about";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedCollections />
        <AboutSection/>
      </main>
    </>
  );
}

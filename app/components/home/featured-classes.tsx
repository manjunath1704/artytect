"use client";

import { useEffect, useState } from "react";
import ClassCard from "@/app/components/cards/class-card";
import { FeaturedEmptyState, FeaturedGridSkeleton } from "./featured-section-states";
import SectionHeader from "./section-header";
import type { PotteryClass } from "@/lib/classes";

export default function FeaturedClassesSection() {
  const [featuredClasses, setFeaturedClasses] = useState<PotteryClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes");
        if (response.ok) {
          const data = await response.json();
          const featured = (data.classes || []).filter(
            (c: PotteryClass) => c.is_featured
          );
          setFeaturedClasses(featured);
        }
      } catch (error) {
        console.error("Error fetching featured classes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchClasses();
  }, []);

  return (
    <section className="bg-[#fff7f4] py-20 md:py-28" aria-labelledby="featured-classes-title">
      <div className="site-container">
        <SectionHeader
          id="featured-classes-title"
          eyebrow="Studio classes"
          title="Learn the rhythm of clay"
          description="Small-group classes for wheel throwing, handbuilding, and surface work, built for generous instruction and calm studio time."
        />

        {isLoading ? <FeaturedGridSkeleton /> : null}
        {!isLoading && featuredClasses.length ?  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {featuredClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                  >
                    <ClassCard
                      classItem={classItem}
                      imageSizes="(min-width: 1280px) 30vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
                    />
                  </div>
                ))}
        </div> : null }
       
        
        {!isLoading && !featuredClasses.length ? (
          <FeaturedEmptyState
            title="No featured classes yet"
            description="Mark classes as featured to show them on the homepage."
          />
        ) : null}
      </div>
    </section>
  );
}

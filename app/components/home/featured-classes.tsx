import ClassCard from "@/app/components/cards/class-card";
import { potteryClasses } from "@/lib/classes";
import { FeaturedEmptyState, FeaturedGridSkeleton } from "./featured-section-states";
import SectionHeader from "./section-header";
//import ViewMoreLink from "./view-more-link";

type FeaturedClassesSectionProps = {
  isLoading?: boolean;
};

export default function FeaturedClassesSection({
  isLoading = false,
}: FeaturedClassesSectionProps) {
  const featuredClasses = potteryClasses.filter((item) => item.featured);

  return (
    <section className="bg-[#fff7f4] py-20 md:py-28" aria-labelledby="featured-classes-title">
      <div className="site-container">
        <SectionHeader
          id="featured-classes-title"
          eyebrow="Studio classes"
          title="Learn the rhythm of clay"
          description="Small-group classes for wheel throwing, handbuilding, and surface work, built for generous instruction and calm studio time."
          //action={<ViewMoreLink href="/classes">View More Classes</ViewMoreLink>}
        />

        {isLoading ? <FeaturedGridSkeleton /> : null}
        {!isLoading && featuredClasses.length ?  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {featuredClasses.map((classItem) => (
                  <div
                    key={classItem.slug}
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

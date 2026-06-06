/**
 * EXAMPLE: How to integrate FAQ Section into your website
 * 
 * This file shows example usage of the FAQSection component.
 * Copy and adapt this code to your actual page files.
 */

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 1: Simple Homepage Integration
// ═══════════════════════════════════════════════════════════════════════════

import FAQSection from "@/app/components/home/faq-section";

export default function HomePage() {
  return (
    <>
      {/* Hero section */}
      <section className="bg-gradient-to-b from-[#f5f0eb] to-[#fffdf9] px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-5xl text-[#1b1511]">
            Welcome to Artytect
          </h1>
          <p className="mt-4 text-[#665b4f]">
            Handcrafted pottery for your home
          </p>
        </div>
      </section>

      {/* Featured products section */}
      {/* ... other sections ... */}

      {/* FAQ Section */}
      <FAQSection
        eyebrow="Common Questions"
        title="Frequently Asked Questions"
        description="Find answers to questions about our pottery, classes, and services."
      />

      {/* Footer */}
      {/* ... footer ... */}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 2: Integration with Custom Styling
// ═══════════════════════════════════════════════════════════════════════════

import FAQSection from "@/app/components/home/faq-section";

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <div className="bg-[#fffdf9] px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl text-[#1b1511]">Contact Us</h1>
          <p className="mt-2 text-[#665b4f]">
            Get in touch with our team or find answers below.
          </p>
        </div>
      </div>

      {/* Contact form section */}
      {/* ... contact form ... */}

      {/* FAQ Section - positioned after contact form */}
      <FAQSection
        eyebrow="Still have questions?"
        title="Frequently Asked Questions"
        description="Check our FAQ section for quick answers."
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 3: Multiple FAQ Sections (with custom titles)
// ═══════════════════════════════════════════════════════════════════════════

import FAQSection from "@/app/components/home/faq-section";

export default function SupportPage() {
  return (
    <>
      {/* General FAQ Section */}
      <FAQSection
        eyebrow="Getting Started"
        title="General Questions"
        description="Learn more about Artytect and our products."
      />

      {/* Shipping & Orders FAQ Section */}
      <FAQSection
        eyebrow="Orders & Shipping"
        title="Shipping & Order FAQs"
        description="Information about orders, shipping, and delivery."
      />

      {/* Classes & Workshops FAQ Section */}
      <FAQSection
        eyebrow="Learn With Us"
        title="Classes & Workshops"
        description="Questions about our pottery classes and workshops."
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 4: With Suspense and Error Boundary (Advanced)
// ═══════════════════════════════════════════════════════════════════════════

import { Suspense } from "react";
import FAQSection from "@/app/components/home/faq-section";
import FAQSectionSkeleton from "@/app/components/home/faq-section-skeleton";

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return children;
}

export default function AdvancedPage() {
  return (
    <>
      {/* Main content */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-4xl text-[#1b1511]">
            Our Services
          </h2>
          {/* ... content ... */}
        </div>
      </section>

      {/* FAQ Section with Suspense for better UX */}
      <ErrorBoundary>
        <Suspense fallback={<FAQSectionSkeleton />}>
          <FAQSection
            eyebrow="Need Help?"
            title="Questions About Our Services"
            description="Find answers to common questions about our pottery services."
          />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT PROPS REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * FAQSection Component Props
 * 
 * All props are optional and have sensible defaults.
 */

interface FAQSectionProps {
  /**
   * Small uppercase text above the title (eyebrow)
   * @default "Common Questions"
   */
  eyebrow?: string;

  /**
   * Main section title (displayed in serif display font)
   * @default "Frequently Asked Questions"
   */
  title?: string;

  /**
   * Description text below the title
   * @default "Find answers to common questions about our pottery..."
   */
  description?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// USAGE PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pattern 1: Default Values
 * Uses all defaults - change them in FAQSection component or via props
 */
<FAQSection />;

/**
 * Pattern 2: Custom Title Only
 */
<FAQSection title="Your Questions Answered" />;

/**
 * Pattern 3: All Custom
 */
<FAQSection
  eyebrow="Have Questions?"
  title="Frequently Asked Questions"
  description="Get quick answers to your questions about our services."
/>;

/**
 * Pattern 4: Minimal (just title)
 */
<FAQSection
  title="FAQs"
/>;

// ═══════════════════════════════════════════════════════════════════════════
// STYLING & CUSTOMIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The FAQSection component uses the following Tailwind classes:
 * 
 * Section background: bg-[#fffdf9]
 * Padding: px-6 py-20 sm:px-8 md:py-28 lg:px-10
 * Container max-width: max-w-2xl
 * 
 * If you need to modify styling, you can:
 * 1. Edit app/components/home/faq-section.tsx directly
 * 2. Wrap the component in a div with custom styling
 * 
 * Example: Wrap with custom styling
 */

export function CustomStyledFAQPage() {
  return (
    <div className="bg-gradient-to-b from-[#f5f0eb] to-[#fffdf9]">
      {/* Custom wrapper styling */}
      <FAQSection
        eyebrow="Our FAQ Section"
        title="Popular Questions"
        description="Find answers here."
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Manage FAQs from the Admin Panel
 * 
 * URL: /admin/faqs
 * 
 * Features:
 * - Create new FAQs
 * - Edit existing FAQs
 * - Delete FAQs
 * - Search FAQs
 * - Activate/deactivate FAQs
 * - Set display order
 * - View created dates
 * 
 * Only active FAQs appear on the public website.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TECHNICAL DETAILS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * How the FAQSection works:
 * 
 * 1. Component mounts and fetches FAQs from /api/faqs
 * 2. Shows loading skeleton while fetching
 * 3. Fetches only active FAQs, sorted by display_order
 * 4. If no FAQs, section doesn't render (returns null)
 * 5. User can expand/collapse individual FAQs
 * 6. Only one FAQ can be open at a time
 * 7. Smooth Framer Motion animations
 * 
 * API Response Format:
 * {
 *   faqs: [
 *     {
 *       id: "uuid",
 *       question: "Question text",
 *       answer: "Answer text",
 *       display_order: 10,
 *       is_active: true,
 *       created_at: "2024-...",
 *       updated_at: "2024-..."
 *     }
 *   ]
 * }
 */

// ═══════════════════════════════════════════════════════════════════════════
// BEST PRACTICES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ✅ DO:
 * - Add FAQSection to multiple pages
 * - Customize eyebrow, title, description for each page
 * - Keep questions concise and answers helpful
 * - Organize FAQs by display_order in admin
 * - Deactivate outdated FAQs instead of deleting
 * 
 * ❌ DON'T:
 * - Add the same FAQ twice (users won't see duplicates)
 * - Use HTML tags in question/answer (they won't render)
 * - Leave FAQs with empty answers
 * - Set very large display_order numbers (keep to 10, 20, 30, etc.)
 */

export default function BestPracticesExample() {
  return (
    <>
      {/* Different pages, different FAQ contexts */}
      
      {/* Homepage FAQ */}
      <FAQSection
        eyebrow="Have Questions?"
        title="Frequently Asked Questions"
        description="Find quick answers about our pottery and services."
      />

      {/* Classes page FAQ */}
      <FAQSection
        eyebrow="Class Info"
        title="Class FAQs"
        description="Questions about our pottery classes and workshops."
      />
    </>
  );
}

/**
 * That's it! You now have a fully functional FAQ system.
 * 
 * Next steps:
 * 1. Copy this file for reference
 * 2. Use one of the examples above in your actual pages
 * 3. Go to /admin/faqs and create some FAQs
 * 4. Your FAQ section will appear on the public site
 * 
 * Questions? Check FAQ_IMPLEMENTATION_GUIDE.md for detailed docs.
 */

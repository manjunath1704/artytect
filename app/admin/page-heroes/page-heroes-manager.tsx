"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { AppSelect, type SelectOption } from "@/components/ui/app-select";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type PageHero = {
  id?: string;
  page_key: string;
  eyebrow: string;
  title: string;
  description: string;
  background_image_url: string;
  button_label: string;
  button_href: string;
  sidebar_label: string;
  sidebar_description: string;
  sidebar_stat_1_value: string;
  sidebar_stat_1_label: string;
  sidebar_stat_2_value: string;
  sidebar_stat_2_label: string;
  sidebar_stat_3_value: string;
  sidebar_stat_3_label: string;
};

type PageHeroesManagerProps = {
  initialUserEmail: string;
  initialHeroes: PageHero[];
};

const PAGE_OPTIONS: SelectOption[] = [
  { value: "categories", label: "Categories Page" },
  { value: "classes", label: "Classes Page" },
  { value: "products", label: "Products Page" },
  { value: "blog", label: "Blog Page" },
];

const PAGE_LABELS: Record<string, string> = {
  categories: "Categories",
  classes: "Classes",
  products: "Products",
  blog: "Blog",
};

const inputClassName =
  "mt-2 w-full rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function PageHeroesManager({
  initialUserEmail,
  initialHeroes,
}: PageHeroesManagerProps) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [heroes, setHeroes] = useState<PageHero[]>(initialHeroes);
  const [selectedPage, setSelectedPage] = useState<string>("categories");
  const [saving, setSaving] = useState(false);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  // Editable fields
  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonHref, setButtonHref] = useState("");
  const [sidebarLabel, setSidebarLabel] = useState("");
  const [sidebarDescription, setSidebarDescription] = useState("");
  const [sidebarStat1Value, setSidebarStat1Value] = useState("");
  const [sidebarStat1Label, setSidebarStat1Label] = useState("");
  const [sidebarStat2Value, setSidebarStat2Value] = useState("");
  const [sidebarStat2Label, setSidebarStat2Label] = useState("");
  const [sidebarStat3Value, setSidebarStat3Value] = useState("");
  const [sidebarStat3Label, setSidebarStat3Label] = useState("");

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/admin/login");
        return;
      }
      setCheckingSession(false);
    };
    void syncSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [initialUserEmail, router]);

  // Load hero data when page selection changes
  useEffect(() => {
    const hero = heroes.find((h) => h.page_key === selectedPage);
    if (hero) {
      setEyebrow(hero.eyebrow);
      setTitle(hero.title);
      setDescription(hero.description);
      setButtonLabel(hero.button_label);
      setButtonHref(hero.button_href);
      setSidebarLabel(hero.sidebar_label);
      setSidebarDescription(hero.sidebar_description);
      setSidebarStat1Value(hero.sidebar_stat_1_value);
      setSidebarStat1Label(hero.sidebar_stat_1_label);
      setSidebarStat2Value(hero.sidebar_stat_2_value);
      setSidebarStat2Label(hero.sidebar_stat_2_label);
      setSidebarStat3Value(hero.sidebar_stat_3_value);
      setSidebarStat3Label(hero.sidebar_stat_3_label);
    } else {
      setEyebrow("");
      setTitle("");
      setDescription("");
      setButtonLabel("");
      setButtonHref("");
      setSidebarLabel("");
      setSidebarDescription("");
      setSidebarStat1Value("");
      setSidebarStat1Label("");
      setSidebarStat2Value("");
      setSidebarStat2Label("");
      setSidebarStat3Value("");
      setSidebarStat3Label("");
    }
    setBackgroundFile(null);
  }, [selectedPage, heroes]);

  const currentHero = heroes.find((h) => h.page_key === selectedPage);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(`Saving ${PAGE_LABELS[selectedPage]} hero...`);

    try {
      const formData = new FormData();
      formData.append("pageKey", selectedPage);
      formData.append("eyebrow", eyebrow.trim());
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("buttonLabel", buttonLabel.trim());
      formData.append("buttonHref", buttonHref.trim());
      formData.append("sidebarLabel", sidebarLabel.trim());
      formData.append("sidebarDescription", sidebarDescription.trim());
      formData.append("sidebarStat1Value", sidebarStat1Value.trim());
      formData.append("sidebarStat1Label", sidebarStat1Label.trim());
      formData.append("sidebarStat2Value", sidebarStat2Value.trim());
      formData.append("sidebarStat2Label", sidebarStat2Label.trim());
      formData.append("sidebarStat3Value", sidebarStat3Value.trim());
      formData.append("sidebarStat3Label", sidebarStat3Label.trim());
      if (backgroundFile) {
        formData.append("backgroundImage", backgroundFile);
      }

      const response = await fetch("/api/admin/page-heroes", {
        method: "PUT",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save hero.");

      // Update local state
      setHeroes((current) => {
        const existing = current.find((h) => h.page_key === selectedPage);
        const updatedHero: PageHero = {
          ...existing,
          page_key: selectedPage,
          eyebrow: eyebrow.trim(),
          title: title.trim(),
          description: description.trim(),
          background_image_url: result.hero.background_image_url ?? existing?.background_image_url ?? "",
          button_label: buttonLabel.trim(),
          button_href: buttonHref.trim(),
          sidebar_label: sidebarLabel.trim(),
          sidebar_description: sidebarDescription.trim(),
          sidebar_stat_1_value: sidebarStat1Value.trim(),
          sidebar_stat_1_label: sidebarStat1Label.trim(),
          sidebar_stat_2_value: sidebarStat2Value.trim(),
          sidebar_stat_2_label: sidebarStat2Label.trim(),
          sidebar_stat_3_value: sidebarStat3Value.trim(),
          sidebar_stat_3_label: sidebarStat3Label.trim(),
        };

        if (existing) {
          return current.map((h) => (h.page_key === selectedPage ? updatedHero : h));
        }
        return [...current, updatedHero];
      });

      setBackgroundFile(null);
      toast.success(`${PAGE_LABELS[selectedPage]} hero saved.`, { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save hero.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-[#665b4f]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Page Hero Sections</h1>
            <p className="mt-2 text-sm text-[#665b4f]">
              Manage the hero section content for each public page.
            </p>
          </div>

          {/* Page selector */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-[#352a21]">
              Select Page
            </label>
            <div className="mt-2 max-w-xs">
              <AppSelect
                instanceId="page-hero-selector"
                value={PAGE_OPTIONS.find((o) => o.value === selectedPage)}
                options={PAGE_OPTIONS}
                onChange={(option) => setSelectedPage(option?.value ?? "categories")}
                isSearchable={false}
              />
            </div>
          </div>
        </section>

        {/* Edit form */}
        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">
            {PAGE_LABELS[selectedPage]} Hero
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-[#352a21]">
              Eyebrow Text
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                className={inputClassName}
                placeholder="categories"
              />
            </label>
            <label className="block text-sm font-medium text-[#352a21]">
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClassName}
                placeholder="Explore our ceramic forms"
              />
            </label>
          </div>

          <label className="mt-5 block text-sm font-medium text-[#352a21]">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClassName} min-h-[100px] resize-y`}
              placeholder="Hero description..."
            />
          </label>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-[#352a21]">
              Button Label
              <input
                type="text"
                value={buttonLabel}
                onChange={(e) => setButtonLabel(e.target.value)}
                className={inputClassName}
                placeholder="Browse categories"
              />
            </label>
            <label className="block text-sm font-medium text-[#352a21]">
              Button Href
              <input
                type="text"
                value={buttonHref}
                onChange={(e) => setButtonHref(e.target.value)}
                className={inputClassName}
                placeholder="#collections"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-[#352a21]">
              Sidebar Label
              <input
                type="text"
                value={sidebarLabel}
                onChange={(e) => setSidebarLabel(e.target.value)}
                className={inputClassName}
                placeholder="categories"
              />
            </label>
            <label className="block text-sm font-medium text-[#352a21]">
              Sidebar Description
              <input
                type="text"
                value={sidebarDescription}
                onChange={(e) => setSidebarDescription(e.target.value)}
                className={inputClassName}
                placeholder="Explore each collection..."
              />
            </label>
          </div>

          {/* Sidebar Stats */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-[#352a21]">Sidebar Stats</h3>
            <p className="mt-1 text-xs text-[#8a7765]">Configure the 3 stat columns shown in the hero sidebar.</p>
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#352a21]">
                Stat 1 Value
                <input
                  type="text"
                  value={sidebarStat1Value}
                  onChange={(e) => setSidebarStat1Value(e.target.value)}
                  className={inputClassName}
                  placeholder="Dynamic or static value"
                />
              </label>
              <label className="block text-sm font-medium text-[#352a21]">
                Stat 1 Label
                <input
                  type="text"
                  value={sidebarStat1Label}
                  onChange={(e) => setSidebarStat1Label(e.target.value)}
                  className={inputClassName}
                  placeholder="categories"
                />
              </label>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#352a21]">
                Stat 2 Value
                <input
                  type="text"
                  value={sidebarStat2Value}
                  onChange={(e) => setSidebarStat2Value(e.target.value)}
                  className={inputClassName}
                  placeholder="100+"
                />
              </label>
              <label className="block text-sm font-medium text-[#352a21]">
                Stat 2 Label
                <input
                  type="text"
                  value={sidebarStat2Label}
                  onChange={(e) => setSidebarStat2Label(e.target.value)}
                  className={inputClassName}
                  placeholder="Pieces"
                />
              </label>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#352a21]">
                Stat 3 Value
                <input
                  type="text"
                  value={sidebarStat3Value}
                  onChange={(e) => setSidebarStat3Value(e.target.value)}
                  className={inputClassName}
                  placeholder="WA"
                />
              </label>
              <label className="block text-sm font-medium text-[#352a21]">
                Stat 3 Label
                <input
                  type="text"
                  value={sidebarStat3Label}
                  onChange={(e) => setSidebarStat3Label(e.target.value)}
                  className={inputClassName}
                  placeholder="Order"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Background image */}
        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">Background Image</h2>
          <p className="mt-1 text-sm text-[#665b4f]">Leave empty to keep the current image.</p>

          <div className="mt-6">
            <ImageUploader
              label="Hero Background"
              hint="Full-width background image for the hero section"
              file={backgroundFile}
              onChange={setBackgroundFile}
              onRemove={() => setBackgroundFile(null)}
            />
          </div>

          {/* Current image preview */}
          {currentHero?.background_image_url && !backgroundFile && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7765]">
                Current background
              </p>
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-[#e8ddd1] bg-[#f5eee4]">
                <Image
                  src={currentHero.background_image_url}
                  alt={`${PAGE_LABELS[selectedPage]} hero background`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>
          )}
          {backgroundFile && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7765]">
                New background preview
              </p>
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-[#e8ddd1] bg-[#f5eee4]">
                <Image
                  src={URL.createObjectURL(backgroundFile)}
                  alt="New hero background preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          {!currentHero?.background_image_url && !backgroundFile && (
            <div className="mt-6 flex aspect-[21/9] w-full items-center justify-center rounded-2xl border border-dashed border-[#d9ccbc] bg-[#fcfaf7]">
              <div className="text-center text-[#8a7765]">
                <ImageIcon className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm">No background image set</p>
              </div>
            </div>
          )}
        </section>

        {/* Save button */}
        <div className="mt-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-12 rounded-full bg-[#1b1511] px-8 text-[#f8f2e8] hover:bg-[#2a211a]"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save {PAGE_LABELS[selectedPage]} Hero
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
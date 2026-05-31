"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type PublicSectionVisibility = {
  section_key: string;
  label: string;
  is_visible: boolean;
  sort_order: number;
};

type VisibilityManagerProps = {
  initialSections: PublicSectionVisibility[];
};

export default function VisibilityManager({ initialSections }: VisibilityManagerProps) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [sections, setSections] = useState(initialSections);
  const [savingKey, setSavingKey] = useState<string | null>(null);

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin/login");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const updateVisibility = async (section: PublicSectionVisibility) => {
    const nextVisibility = !section.is_visible;
    setSavingKey(section.section_key);
    setSections((current) =>
      current.map((item) =>
        item.section_key === section.section_key
          ? { ...item, is_visible: nextVisibility }
          : item,
      ),
    );

    const toastId = toast.loading(`${nextVisibility ? "Showing" : "Hiding"} ${section.label}...`);

    try {
      const response = await fetch("/api/admin/public-section-visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey: section.section_key,
          isVisible: nextVisibility,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to update section visibility.");
      }

      toast.success(`${section.label} is now ${nextVisibility ? "visible" : "hidden"}.`, {
        id: toastId,
      });
    } catch (error) {
      setSections((current) =>
        current.map((item) =>
          item.section_key === section.section_key
            ? { ...item, is_visible: section.is_visible }
            : item,
        ),
      );
      toast.error(error instanceof Error ? error.message : "Unable to update visibility.", {
        id: toastId,
      });
    } finally {
      setSavingKey(null);
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
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">
              Public Section Visibility
            </h1>
            <p className="mt-2 text-sm text-[#665b4f]">
              Show or hide homepage sections without deleting their content.
            </p>
          </div>

          <div className="mt-8 divide-y divide-[#e8ddd1] overflow-hidden rounded-[24px] border border-[#e8ddd1]">
            {sections.map((section) => {
              const isSaving = savingKey === section.section_key;

              return (
                <div
                  key={section.section_key}
                  className="flex flex-col gap-4 bg-[#fffdf9] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511]">
                      {section.is_visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-base font-medium text-[#1b1511]">{section.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8a7765]">
                        {section.is_visible ? "Visible on public homepage" : "Hidden from public homepage"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={section.is_visible}
                    disabled={isSaving}
                    onClick={() => updateVisibility(section)}
                    className={[
                      "relative h-9 w-16 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60",
                      section.is_visible
                        ? "border-[#1b1511] bg-[#1b1511]"
                        : "border-[#d9ccbc] bg-[#f5eee4]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1b1511] shadow-sm transition",
                        section.is_visible ? "left-8" : "left-1",
                      ].join(" ")}
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    </span>
                    <span className="sr-only">
                      {section.is_visible ? "Hide" : "Show"} {section.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

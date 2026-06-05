"use client";

import { useState } from "react";
import { BookOpen, Users, Award, Clock, Settings } from "lucide-react";
import HeroSection from "./sections/hero-section";
import ContentSection from "./sections/content-section";
import ValuesSection from "./sections/values-section";
import TimelineSection from "./sections/timeline-section";
import TeamSection from "./sections/team-section";

type Tab = "hero" | "content" | "values" | "timeline" | "team";

type HeroData = {
  id?: string;
  title: string;
  subtitle: string;
  hero_image_url: string;
  hero_image_alt: string;
} | null;

type ContentData = {
  id?: string;
  who_we_are_title: string;
  who_we_are_content: string;
  who_we_are_image_url: string | null;
  journey_title: string;
  journey_content: string;
  journey_image_url: string | null;
  mission_title: string;
  mission_content: string;
  vision_title: string;
  vision_content: string;
} | null;

export type ValueData = {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
};

export type TimelineData = {
  id: string;
  year: string;
  title: string;
  description: string;
  image_url: string | null;
  sort_order: number;
};

export type TeamData = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
};

type OurStoryManagerProps = {
  initialHero: HeroData;
  initialContent: ContentData;
  initialValues: ValueData[];
  initialTimeline: TimelineData[];
  initialTeam: TeamData[];
};

export default function OurStoryManager({
  initialHero,
  initialContent,
  initialValues,
  initialTimeline,
  initialTeam,
}: OurStoryManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [hero, setHero] = useState(initialHero);
  const [content, setContent] = useState(initialContent);
  const [values, setValues] = useState(initialValues);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [team, setTeam] = useState(initialTeam);

  const tabs = [
    { id: "hero" as const, label: "Hero Section", icon: Settings },
    { id: "content" as const, label: "Content", icon: BookOpen },
    { id: "values" as const, label: "Values", icon: Award },
    { id: "timeline" as const, label: "Timeline", icon: Clock },
    { id: "team" as const, label: "Team", icon: Users },
  ];

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
            Content Management
          </p>
          <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">
            Our Story Page
          </h1>
          <p className="mt-2 text-sm text-[#6b5f55]">
            Manage hero section, brand story, values, timeline, and team members
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 overflow-x-auto rounded-[32px] bg-white shadow-sm">
          <div className="flex gap-2 border-b border-[#eadfd4] p-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${
                  activeTab === id
                    ? "bg-[#1b1511] text-white"
                    : "text-[#6b5f55] hover:bg-[#f5eee4]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "hero" && (
              <HeroSection hero={hero} onUpdate={setHero} />
            )}
            {activeTab === "content" && (
              <ContentSection content={content} onUpdate={setContent} />
            )}
            {activeTab === "values" && (
              <ValuesSection values={values} onUpdate={setValues} />
            )}
            {activeTab === "timeline" && (
              <TimelineSection timeline={timeline} onUpdate={setTimeline} />
            )}
            {activeTab === "team" && (
              <TeamSection team={team} onUpdate={setTeam} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

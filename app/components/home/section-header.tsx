import type { ReactNode } from "react";

type SectionHeaderProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="mb-10 grid gap-6 border-b border-[#d8cabd] pb-8 md:grid-cols-[0.8fr_1fr] md:items-end">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a6b4e]">
          {eyebrow}
        </p>
        <h2
          id={id}
          className="mt-3 max-w-2xl text-4xl font-display uppercase leading-none tracking-normal text-[#1b1511] sm:text-5xl"
        >
          {title}
        </h2>
      </div>
      <div className="flex max-w-2xl flex-col gap-5 md:justify-self-end">
        <p className="text-sm leading-7 text-[#665b4f]">{description}</p>
        {action ? <div className="md:self-end">{action}</div> : null}
      </div>
    </div>
  );
}

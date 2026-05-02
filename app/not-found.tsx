import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-earthware-radial px-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7c6e5f]">
          Earthware
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-[-0.04em] text-[#1a1511]">
          Page not found
        </h1>
        <p className="mt-4 text-base leading-7 text-[#5f5448]">
          The page you were looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#1a1511] px-6 text-sm font-semibold text-[#f7f2e8]"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}

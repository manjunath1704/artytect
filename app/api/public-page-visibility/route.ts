import { NextResponse } from "next/server";

import { getPublicPageVisibility } from "@/lib/public-page-visibility";

export const dynamic = "force-dynamic";

export async function GET() {
  const pages = await getPublicPageVisibility();
  return NextResponse.json({ pages });
}

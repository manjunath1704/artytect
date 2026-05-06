import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type CategoryListItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  hoverThumbnailUrl: string;
};

export async function GET() {
  const categories: CategoryListItem[] = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailUrl: true,
      hoverThumbnailUrl: true,
    },
  });

  return NextResponse.json({
    categories: categories.map((category) => ({
      id: category.id,
      title: category.title,
      slug: category.slug,
      description: category.description,
      thumbnail_url: category.thumbnailUrl,
      hover_thumbnail_url: category.hoverThumbnailUrl,
    })),
  });
}

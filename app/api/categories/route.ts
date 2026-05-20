import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CategoryListItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  hoverThumbnailUrl: string;
};

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data: categoriesData, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ categories: [] });
    }

    const categories: CategoryListItem[] = (categoriesData || []).map((cat: {
      id: number;
      category_name: string;
      category_slug: string;
      category_description: string;
      category_thumbnail: string;
      category_hover_thumbnail: string;
    }) => ({
      id: String(cat.id),
      title: cat.category_name || '',
      slug: cat.category_slug || '',
      description: cat.category_description || '',
      thumbnailUrl: cat.category_thumbnail || '',
      hoverThumbnailUrl: cat.category_hover_thumbnail || cat.category_thumbnail || '',
    }));

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
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json({ categories: [] });
  }
}

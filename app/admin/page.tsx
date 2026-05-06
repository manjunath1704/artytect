import { redirect } from "next/navigation";

import AdminPanel from "./admin-panel";
import { ensureCategoryThumbnailsBucket } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  await ensureCategoryThumbnailsBucket();

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const categories = await prisma.category.findMany({
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

  return (
    // <AdminPanel
    //   initialUserEmail={data.user.email ?? ""}
    //   initialCategories={categories.map((category) => ({
    //     id: category.id,
    //     title: category.title,
    //     slug: category.slug,
    //     description: category.description,
    //     thumbnail_url: category.thumbnailUrl,
    //     hover_thumbnail_url: category.hoverThumbnailUrl,
    //   }))}
    // />
    <></>
  );
}

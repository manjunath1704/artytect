import { getPublicPageVisibility } from "@/lib/public-page-visibility";

import NavbarClient, { type NavbarItem } from "./navbar-client";

const NAV_ITEMS: NavbarItem[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "categories", label: "Categories", href: "/categories" },
  { key: "products", label: "Products", href: "/products" },
  { key: "classes", label: "Classes", href: "/classes" },
  { key: "blog", label: "Blog", href: "/blog" },
  { key: "contact", label: "Contact", href: "/contact" },
];

type NavbarProps = {
  forceSolid?: boolean;
  transparentTone?: "light" | "dark";
};

export default async function Navbar(props: NavbarProps) {
  const pageVisibility = await getPublicPageVisibility();
  const visiblePageKeys = new Set<string>(
    pageVisibility.filter((page) => page.is_visible).map((page) => page.page_key),
  );
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => item.key === "home" || visiblePageKeys.has(item.key),
  );

  return <NavbarClient {...props} navItems={visibleNavItems} />;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import "@fontsource/dm-serif-display/400.css";
import WhatsAppFloatingButton from "./components/whatsapp-floating-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio Haritham | Handcrafted Pottery, Ceramic Art & Pottery Classes",
  description: "Discover handcrafted ceramics, artistic pottery collections, and immersive pottery workshops at Studio Haritham. Thoughtfully made pieces inspired by earth, craft, and slow living.",
  icons:{
    icon: "/favicon.png",
  },openGraph: {
    title: "Studio Haritham | Handcrafted Pottery, Ceramic Art & Pottery Classes",
    description: "Discover handcrafted ceramics, artistic pottery collections, and immersive pottery workshops at Studio Haritham. Thoughtfully made pieces inspired by earth, craft, and slow living.",
    url: "https://artytect.vercel.app/",
    siteName: "Studio Haritham",
    images: [
      {
        url: "/haritham-og.png",
        width: 580,
        height: 250,
        alt: "Studio Haritham",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Studio Haritham | Handcrafted Pottery, Ceramic Art & Pottery Classes",
    description: "Discover handcrafted ceramics, artistic pottery collections, and immersive pottery workshops at Studio Haritham. Thoughtfully made pieces inspired by earth, craft, and slow living.",
    images: ["/haritham-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}

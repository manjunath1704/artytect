import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import "@fontsource/dm-serif-display/400.css";
import WhatsAppFloatingButton from "./components/whatsapp-floating-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "Earthware Landing Page",
  description: "Reusable Next.js + Tailwind conversion of the Earthware ceramic pot design.",
  icons:{
    icon: "/favicon.png",
  },openGraph: {
    title: "Studio Haritham",
    description: "Handcrafted pottery and earthy home decor.",
    url: "https://artytect.vercel.app/",
    siteName: "Studio Haritham",
    images: [
      {
        url: "/favicon.png",
        width: 500,
        height: 500,
        alt: "Studio Haritham",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Studio Haritham",
    description: "Handcrafted pottery and earthy home decor.",
    images: ["/favicon.png"],
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

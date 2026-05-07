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

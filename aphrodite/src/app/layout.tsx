import type { Metadata } from "next";
import "./globals.css";
import { dxStirus, harmond } from "./fonts";
import SmoothScroll from "@/components/SmoothScroll";
import clsx from "clsx";

export const metadata: Metadata = {
  title: "MOIRAI | The Agentic Intent-Action OS",
  description: "Weaving the thread of daily action into the narrative of life intent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(dxStirus.variable, harmond.variable, "bg-swiss-cream antialiased")}>
        <SmoothScroll>
            {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
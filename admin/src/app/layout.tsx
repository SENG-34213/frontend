import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "TiT Admin Dashboard",
  description: "TiT platform administration workspace.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

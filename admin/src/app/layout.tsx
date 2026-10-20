import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "Mentify Admin Dashboard",
  description: "Mentify platform administration workspace.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

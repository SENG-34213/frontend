import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./tailwind.css";

const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

export const metadata: Metadata = {
  title: "TiT Admin Dashboard",
  description: "TiT platform administration workspace.",
  icons: {
    icon: `${appBasePath}/tit-favicon.svg`,
    shortcut: `${appBasePath}/tit-favicon.svg`,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

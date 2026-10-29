import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./tailwind.css";

const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

export const metadata: Metadata = {
  title: "TiT Admin Dashboard",
  description: "TiT platform administration workspace.",
  icons: {
    icon: `${appBasePath}/TiTJaffna-logo.jpeg`,
    shortcut: `${appBasePath}/TiTJaffna-logo.jpeg`,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

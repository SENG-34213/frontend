import type { Metadata } from "next";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "TiT Teacher Workspace",
  description: "A focused teaching workspace for courses, students, assessment, and insights.",
  icons: {
    icon: "/tit-favicon.svg",
    shortcut: "/tit-favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

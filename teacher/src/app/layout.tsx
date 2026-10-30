import type { Metadata } from "next";
import "./tailwind.css";

const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

export const metadata: Metadata = {
  title: "TiT Teacher Workspace",
  description: "A focused teaching workspace for courses, students, assessment, and insights.",
  icons: {
    icon: `${appBasePath}/TiTJaffna-logo.jpeg`,
    shortcut: `${appBasePath}/TiTJaffna-logo.jpeg`,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

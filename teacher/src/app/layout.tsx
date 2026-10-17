import type { Metadata } from "next";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "Mentify Teacher Workspace",
  description: "A focused teaching workspace for courses, students, assessment, and insights.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

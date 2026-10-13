import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./mentify-theme.css";
import "./teacher-dashboard-theme.css";
import "./teacher-assets.css";
import "./teacher-pages.css";
import "../../../shared/materials/materials.css";
import "./teacher-materials.css";
import "./teacher-admin-style.css";
import "./teacher-assignments.css";
import "./teacher-attendance.css";
import "./teacher-curriculum.css";
import "./teacher-library.css";
import "./teacher-catalog.css";
import "./teacher-students.css";
import "./teacher-assessments.css";
import "./teacher-overview.css";
import "./teacher-calendar.css";
import "./teacher-messages.css";
import "./teacher-copilot.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mentify Teacher Workspace",
  description: "A focused teaching workspace for courses, assessments, communication, and AI support.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TiT · Student Portal",
  description: "Next-generation connected student learning portal for TiT LMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors">
        {children}
      </body>
    </html>
  );
}

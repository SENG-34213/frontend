import type { Metadata } from "next";
import "./globals.css";

const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

export const metadata: Metadata = {
  title: "TiT · Student Portal",
  description: "Next-generation connected student learning portal for TiT LMS",
  icons: {
    icon: `${appBasePath}/tit-favicon.svg`,
    shortcut: `${appBasePath}/tit-favicon.svg`,
  },
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

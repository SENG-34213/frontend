import "./globals.css";
import { Syne, Outfit } from "next/font/google";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Institute Name | Education and Resources",
  description: "Explore our programmes, services, and public educational resources.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}

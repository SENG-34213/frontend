import type { Metadata } from "next";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "Mentify · Student workspace",
  description: "Your learning workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

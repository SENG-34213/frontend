
import "./globals.css";

export const metadata = {
  title: "Institute Name | Education and Resources",
  description:
    "Explore our programmes, services, and public educational resources."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

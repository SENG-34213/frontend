import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { supportedLanguages } from "../../lib/translations";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  // Generate the three supported language layouts.
  return supportedLanguages.map((lang) => ({ lang }));
}

export default async function LanguageLayout({ children, params }) {
  // Current Next.js versions provide route params as a Promise.
  const { lang } = await params;

  // Reject unsupported language prefixes.
  if (!supportedLanguages.includes(lang)) {
    notFound();
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

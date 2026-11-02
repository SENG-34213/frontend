import { notFound } from "next/navigation";
import { supportedLanguages } from "../../lib/translations";
import MentifyApp from "../../mentify-ui/App";

export default async function HomePage({ params }) {
  const { lang } = await params;

  if (!supportedLanguages.includes(lang)) {
    notFound();
  }

  return <MentifyApp initialLang={lang} />;
}

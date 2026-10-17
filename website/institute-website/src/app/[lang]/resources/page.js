import { notFound } from "next/navigation";
import ResourceLibrary from "../../../components/ResourceLibrary";
import { supportedLanguages } from "../../../lib/translations";

export default async function ResourcesPage({ params }) {
  const { lang } = await params;

  if (!supportedLanguages.includes(lang)) {
    notFound();
  }

  return <ResourceLibrary lang={lang} />;
}

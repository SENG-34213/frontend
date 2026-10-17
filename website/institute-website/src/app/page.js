import { redirect } from "next/navigation";

export default function RootPage() {
  // Visitors who open the domain without a language prefix
  // are redirected to the English homepage.
  redirect("/en");
}

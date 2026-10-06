export type FormKind = "demo" | "assessment" | "partner" | "contact";
// Public embed identifiers read from the corresponding published Teramis forms.
export const FORMS = {
  demo: {
    id: "35748267-566f-484f-bdfc-6ed141ccdb68",
    title: "Request a demo",
    source: "https://teramis.us/request-a-demo",
    legacy: false,
  },
  assessment: {
    id: "54c8f224-19d1-4295-9822-fbe8ce62c505",
    title: "Request a readiness assessment",
    source: "https://teramis.us/cui-discovery-readiness-assessment-teramis",
    legacy: false,
  },
  partner: {
    id: "a8699719-4809-487d-b7f4-75b3cc2530b6",
    title: "Become a partner",
    source: "https://teramis.us/partners/become-a-partner",
    legacy: true,
  },
  contact: {
    id: "d6cb9355-861f-49e4-a8bf-d6f61b7604be",
    title: "Talk to Teramis",
    source: "https://teramis.us/contact-us",
    legacy: false,
  },
} as const;
export function formForPath(path: string): FormKind | null {
  if (path === "/request-a-demo") return "demo";
  if (path === "/cui-discovery-readiness-assessment-teramis")
    return "assessment";
  if (path === "/partners/become-a-partner") return "partner";
  if (path === "/talk-to-us-about-cui") return "assessment";
  if (path === "/contact-us") return "contact";
  return null;
}

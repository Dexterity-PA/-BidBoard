export type GuideSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
  table?: { headers: string[]; rows: string[][] };
  paragraphsAfter?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: "Finding scholarships" | "Applications" | "Understanding awards";
  topics: string[];
  related: string[];
  intro: string[];
  sections: GuideSection[];
};

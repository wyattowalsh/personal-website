export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;  // Make sure this is included
  image?: string;
  caption?: string;
  updated?: string;
  readingTime?: string;
}

import type { Metadata } from "next";
import { getConfig } from "@/lib/config";

const siteUrl = getConfig().site.url;
const description = "Privacy policy, analytics disclosures, and opt-out controls for Wyatt Walsh's site.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    type: "website",
    title: "Privacy Policy - Wyatt Walsh",
    description,
    url: `${siteUrl}/privacy`,
    siteName: "Wyatt Walsh",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - Wyatt Walsh",
    description,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

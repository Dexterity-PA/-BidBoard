import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import SocialPreview from "@/components/merit/SocialPreview";
import { getGuide } from "@/lib/merit/blog";

export const alt = "Meritously scholarship guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function GuideImage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  return new ImageResponse(<SocialPreview title={guide.title} description={guide.description} />, size);
}

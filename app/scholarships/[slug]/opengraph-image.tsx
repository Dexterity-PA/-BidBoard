import { ImageResponse } from "next/og";
import SocialPreview from "@/components/merit/SocialPreview";
import { getListing } from "@/lib/merit/catalog";

export const alt = "Merit scholarship on Meritously";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getListing(slug);
  const description = listing
    ? `${listing.provider}. ${listing.deadline || "Check the official page for deadlines."}`
    : "Find potential matches and check each award's official requirements.";

  return new ImageResponse(
    <SocialPreview title={listing?.name ?? "Find your next merit scholarship."} description={description.slice(0, 160)} />,
    size,
  );
}

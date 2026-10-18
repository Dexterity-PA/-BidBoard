import { ImageResponse } from "next/og";
import SocialPreview from "@/components/merit/SocialPreview";

export const alt = "Meritously: find your next merit scholarship";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <SocialPreview
      title="Find your next merit scholarship."
      description="Explore awards, find a few that fit and keep track of your applications."
    />,
    size,
  );
}

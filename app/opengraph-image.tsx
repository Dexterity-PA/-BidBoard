import { ImageResponse } from "next/og";
import SocialPreview from "@/components/merit/SocialPreview";

export const alt = "Meritously: free merit scholarship finder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <SocialPreview
      title="Find your next merit scholarship."
      description="Find potential matches. Check official sources. Track your next steps."
    />,
    size,
  );
}

import { ImageResponse } from "next/og";
import SocialPreview from "@/components/merit/SocialPreview";

export const alt = "Privacy Policy | Meritously";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <SocialPreview
      title="Privacy Policy"
      description="What Meritously collects, how it is used, and your choices."
    />,
    size,
  );
}

import { ImageResponse } from "next/og";
import SocialPreview from "@/components/merit/SocialPreview";

export const alt = "Terms of Service | Meritously";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <SocialPreview
      title="Terms of Service"
      description="The terms for using Meritously, your free merit scholarship finder."
    />,
    size,
  );
}

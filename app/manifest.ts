import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Meritously", short_name: "Meritously",
    description: "Free merit scholarships, college awards and competitions.",
    start_url: "/", display: "browser", background_color: "#ffffff", theme_color: "#0f5d3e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}

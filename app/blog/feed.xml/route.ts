import { guideFeed } from "@/lib/merit/blog";

export function GET() {
  return new Response(guideFeed(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}

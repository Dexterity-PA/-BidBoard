export async function newsletterRequestBody(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {};
  }
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export function newsletterRequestIp(request: Request) {
  // Vercel's platform-provided forwarding header takes precedence. Addresses
  // are keyed with a purpose-separated HMAC before durable storage.
  const raw = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "unknown";
  return raw.split(",")[0].trim().slice(0, 128);
}

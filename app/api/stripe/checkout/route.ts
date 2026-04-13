import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe, createCheckoutSession, VALID_PRICE_IDS } from "@/lib/stripe";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { priceId } = body as { priceId: string };

  if (!priceId || !VALID_PRICE_IDS.has(priceId)) {
    return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  let user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { stripeCustomerId: true },
  });

  let stripeCustomerId = user?.stripeCustomerId ?? null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { clerkUserId: userId },
    });
    stripeCustomerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId));
  }

  const url = await createCheckoutSession(userId, email, priceId, stripeCustomerId);
  return NextResponse.json({ url });
}

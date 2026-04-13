import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserTier } from "@/lib/tier";
import { PricingButtons } from "./PricingButtons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const PLANS = [
  {
    name: "Premium",
    price: "$9.99",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    tier: "premium" as const,
    features: ["Unlimited scholarship matches", "Essay recycling suggestions"],
    highlight: false,
  },
  {
    name: "Ultra",
    price: "$49.99",
    priceId: process.env.STRIPE_ULTRA_PRICE_ID!,
    tier: "ultra" as const,
    features: [
      "Everything in Premium",
      "Long-tail scholarships",
    ],
    highlight: true,
  },
  {
    name: "Counselor",
    price: "$199.99",
    priceId: process.env.STRIPE_COUNSELOR_PRICE_ID!,
    tier: "counselor" as const,
    features: [
      "Everything in Ultra",
      "Counselor dashboard",
    ],
    highlight: false,
  },
];

export default async function PricingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const currentTier = await getUserTier(userId);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Choose your plan
          </h1>
          <p className="text-slate-400 mt-3 text-base">
            Unlock more matches, essay recycling, and counselor tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={`bg-slate-900 border rounded-2xl flex flex-col ${
                plan.highlight
                  ? "border-emerald-500 ring-1 ring-emerald-500/40"
                  : "border-slate-800"
              }`}
            >
              {plan.highlight && (
                <div className="text-center pt-3">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pb-2 pt-5 px-6">
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                  {plan.price}
                  <span className="text-sm font-normal text-slate-400">/mo</span>
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6 flex flex-col flex-1 gap-5">
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <PricingButtons
                  priceId={plan.priceId}
                  currentTier={currentTier}
                  planTier={plan.tier}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

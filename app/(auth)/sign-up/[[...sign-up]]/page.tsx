import { SignUp } from "@clerk/nextjs";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";

export const metadata = { title: "Create an account | Meritously", robots: { index: false, follow: false } };

export default function SignUpPage() {
  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main" style={{ display: "grid", placeItems: "center", padding: "48px 16px" }}>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/tracker" />
      </main>
      <SiteFooter />
    </div>
  );
}

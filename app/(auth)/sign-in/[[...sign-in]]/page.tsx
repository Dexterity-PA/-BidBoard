import { SignIn } from "@clerk/nextjs";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";

export const metadata = { title: "Sign in | Meritously", robots: { index: false, follow: false } };

export default function SignInPage() {
  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main" style={{ display: "grid", placeItems: "center", padding: "48px 16px" }}>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/tracker" />
      </main>
      <SiteFooter />
    </div>
  );
}

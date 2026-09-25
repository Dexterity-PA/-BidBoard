import { SignIn } from "@clerk/nextjs";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";

export default function SignInPage() {
  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main" style={{ display: "grid", placeItems: "center", padding: "48px 16px" }}>
        <SignIn fallbackRedirectUrl="/tracker" />
      </main>
      <SiteFooter />
    </div>
  );
}

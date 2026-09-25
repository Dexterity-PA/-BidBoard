import { SignUp } from "@clerk/nextjs";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";

export default function SignUpPage() {
  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main" style={{ display: "grid", placeItems: "center", padding: "48px 16px" }}>
        <SignUp fallbackRedirectUrl="/tracker" />
      </main>
      <SiteFooter />
    </div>
  );
}

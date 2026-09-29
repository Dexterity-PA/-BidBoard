type AdminUser = {
  id: string;
  emailAddresses?: { emailAddress: string; verification?: { status: string } | null }[];
};

export function isAnalyticsAdmin(user: AdminUser | null, configuredEmail: string | undefined, authenticatedId: string | null) {
  const email = configuredEmail?.trim().toLowerCase();
  if (!email || !authenticatedId || user?.id !== authenticatedId) return false;
  return user.emailAddresses?.some((address) => address.verification?.status === "verified" &&
    address.emailAddress.trim().toLowerCase() === email) === true;
}

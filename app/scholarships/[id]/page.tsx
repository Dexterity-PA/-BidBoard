import { redirect } from "next/navigation";

export default async function LegacyScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/scholarship/${id}`);
}

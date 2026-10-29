import { requireAdmin } from "@/lib/auth/require-admin";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export default async function AuthorsPage() {
  await requireAdmin();

  return <TaxonomyManager type="authors" />;
}

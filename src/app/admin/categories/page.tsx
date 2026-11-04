import { requireAdmin } from "@/lib/auth/require-admin";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export default async function CategoriesPage() {
  await requireAdmin();

  return <TaxonomyManager type="categories" />;
}

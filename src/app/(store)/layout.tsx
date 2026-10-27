import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ToastProvider } from "@/components/shared/toast-provider";
import { getCategories } from "@/features/catalog/catalog.service";

export default async function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCategories();

  return (
    <ToastProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-forest focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Navbar categories={categories} />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer categories={categories} />
    </ToastProvider>
  );
}
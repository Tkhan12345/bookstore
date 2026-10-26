
import Link from "next/link";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-[#E6E7DF] bg-[#F8F5ED]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="font-editorial text-2xl font-bold text-[#18392B]"
          >
            BookStore.
          </Link>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/">Home</Link>
            <Link href="/books">Explore Books</Link>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="mt-16 bg-[#18392B] px-6 py-10 text-center text-white">
        <p className="font-editorial text-xl">BookStore.</p>
        <p className="mt-2 text-sm text-[#A8BBA3]">
          Discover your next great read.
        </p>
      </footer>
    </>
  );
}

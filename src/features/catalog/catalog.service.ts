
import { prisma } from "@/lib/prisma";

export async function getBooks() {
  return prisma.book.findMany({
    where: { active: true },
    include: {
      authors: true,
      categories: true,
      inventory: true,
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
}

export async function getBookBySlug(slug: string) {
  return prisma.book.findUnique({
    where: { slug, active: true },
    include: {
      authors: true,
      categories: true,
      inventory: true,
    },
  });
}

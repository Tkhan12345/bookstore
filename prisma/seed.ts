
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const books = [
  {
    title: "Atomic Habits",
    slug: "atomic-habits",
    description:
      "A practical guide to building good habits and breaking bad ones.",
    pricePaise: 49900,
    author: "James Clear",
    category: "Self-Help",
    stock: 20,
  },
  {
    title: "The Psychology of Money",
    slug: "psychology-of-money",
    description:
      "Lessons about wealth, behavior, and financial decision-making.",
    pricePaise: 39900,
    author: "Morgan Housel",
    category: "Finance",
    stock: 15,
  },
  {
    title: "Deep Work",
    slug: "deep-work",
    description:
      "A guide to focused work in a distracted world.",
    pricePaise: 45000,
    author: "Cal Newport",
    category: "Productivity",
    stock: 12,
  },
];

async function main() {
  for (const item of books) {
    const author = await prisma.author.upsert({
      where: {
        slug: item.author.toLowerCase().replace(/\s+/g, "-"),
      },
      update: {},
      create: {
        name: item.author,
        slug: item.author.toLowerCase().replace(/\s+/g, "-"),
      },
    });

    const category = await prisma.category.upsert({
      where: {
        slug: item.category.toLowerCase(),
      },
      update: {},
      create: {
        name: item.category,
        slug: item.category.toLowerCase(),
      },
    });

    const book = await prisma.book.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        pricePaise: item.pricePaise,
        featured: true,
        authors: {
          connect: { id: author.id },
        },
        categories: {
          connect: { id: category.id },
        },
      },
    });

    await prisma.inventory.upsert({
      where: { bookId: book.id },
      update: {},
      create: {
        bookId: book.id,
        quantity: item.stock,
      },
    });
  }

  console.log("BookStore seed completed.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

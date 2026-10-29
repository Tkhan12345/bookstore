import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getAdminForApi() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "UNAUTHENTICATED" as const,
      user: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return {
      error: "FORBIDDEN" as const,
      user: null,
    };
  }

  return {
    error: null,
    user,
  };
}

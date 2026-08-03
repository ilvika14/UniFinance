import { cache } from "react";
import { getSession } from "@/lib/auth";
import { db as prismaDb } from "@/lib/prisma";

export const checkUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const user = await prismaDb.user.findUnique({
    where: { id: session.userId },
  });

  return user;
});

import { getSession } from "@/lib/auth";
import { db as prismaDb } from "@/lib/prisma";

export async function getOrCreateUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const user = await prismaDb.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) throw new Error("Unauthorized");

  return user;
}

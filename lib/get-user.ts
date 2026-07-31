import { auth, currentUser } from "@clerk/nextjs/server";
import { db as prismaDb } from "@/lib/prisma";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await prismaDb.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (user) return user;

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const fullName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

  user = await prismaDb.user.create({
    data: {
      clerkUserId: clerkUser.id,
      name: fullName || clerkUser.username || "Unnamed User",
      imageUrl: clerkUser.imageUrl ?? "",
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
    },
  });

  return user;
}

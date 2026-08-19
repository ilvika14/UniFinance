import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import React from "react";

async function Dashboardlayout({ children }: { children: React.ReactNode }) {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="px-5 rounded-lg">
      {children}
    </div>
  );
}

export default Dashboardlayout;

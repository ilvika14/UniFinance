"use server";

import { Resend } from "resend";
import type { ReactNode } from "react";

export async function sendEmail({ to, subject, react }:{to:string; subject:string; react: ReactNode}) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const data = await resend.emails.send({
      from: "UniFinance <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
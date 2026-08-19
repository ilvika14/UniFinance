import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset link has been sent.",
      });
    }

    // Invalidate any existing tokens for this user
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Send email
    await resend.emails.send({
      from: "UniFinance <onboarding@resend.dev>",
      to: email,
      subject: "Reset your UniFinance password",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 580px; margin: 0 auto; padding: 20px;">
          <div style="background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h1 style="color: #10b981; font-size: 24px; text-align: center; margin-bottom: 8px;">UniFinance</h1>
            <h2 style="color: #1f2937; font-size: 20px; text-align: center; margin-bottom: 24px;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
              Hi ${user.name || "there"},
            </p>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.5;">
              If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

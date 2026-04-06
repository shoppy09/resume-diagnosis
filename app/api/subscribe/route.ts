import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string = (body.email ?? "").trim().toLowerCase();
    const score: number = body.score ?? 0;
    const targetJob: string = body.targetJob ?? "";

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Email 格式不正確" }, { status: 400 });
    }

    // Log subscription (production: integrate Resend / Mailchimp / ConvertKit here)
    console.log(`[Subscribe] email=${email} score=${score} targetJob="${targetJob}"`);

    // TODO: Replace with your email service integration
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.contacts.create({ email, unsubscribed: false, audienceId: process.env.RESEND_AUDIENCE_ID });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "訂閱失敗，請稍後再試" }, { status: 500 });
  }
}

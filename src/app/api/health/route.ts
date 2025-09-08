import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    stripe_pub: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripe_price: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
    stripe_sec: !!process.env.STRIPE_SECRET_KEY,
    stripe_wh: !!process.env.STRIPE_WEBHOOK_SECRET,
    fb_admin: !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
  });
}

// src/app/api/checkout/route.ts (App Router, Next 15)
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  try {
    // 1) form’dan eventId al
    const form = await req.formData();
    const eventId = String(form.get("eventId") || "");
    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    // 2) Firestore’dan event’i çek (Admin’den girdiğimiz fiyatı kullan)
    const snap = await getDoc(doc(db, "events", eventId));
    if (!snap.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const ev = snap.data() as {
      title: string;
      priceCents: number;
      status?: "draft" | "published";
    };

    // draft ise satışa kapat
    if (ev.status !== "published") {
      return NextResponse.json({ error: "Event not purchasable" }, { status: 400 });
    }

    // 3) URL’ler
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error("[checkout] Missing NEXT_PUBLIC_APP_URL");
      return NextResponse.json({ error: "Server misconfig" }, { status: 500 });
    }

    // 4) Stripe Checkout Session (price_data ile dinamik fiyat)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cad", // ihtiyaca göre 'usd'
            product_data: { name: `MatchMade Ticket — ${ev.title}` },
            unit_amount: ev.priceCents, // Firestore’dan cents
          },
          quantity: 1,
        },
      ],
      // ✅ Ödeme sonrası direkt ticket sayfasına
      success_url: `${appUrl}/ticket/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/events/${eventId}?canceled=1`,
      // Webhook için faydalı metadata
      metadata: {
        eventId,
        title: ev.title,
        priceCents: String(ev.priceCents),
      },
    });

    // 5) 303 redirect → Stripe sayfası
    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[checkout] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

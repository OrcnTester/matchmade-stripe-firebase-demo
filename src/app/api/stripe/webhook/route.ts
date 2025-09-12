// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whSecret) {
    console.error("[webhook] missing signature or secret");
    return NextResponse.json(
      { ok: false, error: "missing signature or secret" },
      { status: 400 },
    );
  }

  // Stripe imza doğrulaması için RAW body lazım
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] signature verify FAIL:", msg);
    return NextResponse.json(
      { ok: false, error: "signature verification failed", detail: msg },
      { status: 400 },
    );
  }

  console.log("[webhook] received:", event.type, event.id);

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;

      const ticketId = s.id; // session id = ticket id
  const eventId = s.metadata?.eventId ?? "unknown";

  // 1) payments (zaten var diye bırakıyorum)
  await adb.collection("payments").add({
    sessionId: s.id,
    paymentStatus: s.payment_status,
    amountTotal: s.amount_total,
    currency: s.currency,
    eventId,
    userId: s.metadata?.userId ?? null,
    title: s.metadata?.title ?? "MatchMade Ticket",
    priceCents: Number(s.metadata?.priceCents ?? "0"),
    createdAt: Timestamp.now(),
  });

  // 2) tickets (YENİ — admin scanner bununla doğrulayacak)
  await adb.collection("tickets").doc(ticketId).set({
    ticketId,
    eventId,
    amountTotal: s.amount_total,
    currency: s.currency,
    email: s.customer_details?.email ?? null,
    status: "valid",        // valid | used | invalid
    used: false,
    usedAt: null,
    usedBy: null,
    createdAt: Timestamp.now(),
  }, { merge: true });

  console.log("[webhook] payment & ticket stored:", s.id);

      const userId = s.metadata?.userId ?? "unknown";
      const title = s.metadata?.title ?? "MatchMade Ticket";
      const priceCents = Number(s.metadata?.priceCents ?? "0");

      // Firestore’a ödeme kaydı
      await adb.collection("payments").add({
        sessionId: s.id,
        paymentStatus: s.payment_status,
        amountTotal: s.amount_total,
        currency: s.currency,
        eventId,
        userId,
        title,
        priceCents,
        createdAt: Timestamp.now(),
      });

      console.log("[webhook] payment stored:", s.id);
    } else {
      console.log("[webhook] ignored event type:", event.type);
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] handler ERROR:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

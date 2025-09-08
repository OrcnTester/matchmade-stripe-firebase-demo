import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// --- Firebase Admin init (base64'ten)
function getDb() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64");
  const json = Buffer.from(b64, "base64").toString("utf8");
  const creds = JSON.parse(json);
  const app = getApps()[0] ?? initializeApp({ credential: cert(creds as any) });
  return getFirestore(app);
}

export async function POST(req: NextRequest) {
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  const sk = process.env.STRIPE_SECRET_KEY;

  // Basit env guard
  if (!whsec || !sk) {
    console.error("ENV MISSING", { whsec: !!whsec, sk: !!sk });
    return new NextResponse("ENV missing", { status: 500 });
  }

  const stripe = new Stripe(sk); // apiVersion sabitlemeye gerek yok
  const sig = req.headers.get("stripe-signature") || "";

  // Stripe ham gövde ister → App Router'da req.text() ile ham body alıyoruz
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whsec);
  } catch (err: any) {
    console.error("WEBHOOK SIGNATURE ERROR", err?.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("[WEBHOOK EVENT]", event.type);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const db = getDb();

      // idempotent: session.id ile tekil doc
      const docRef = db.collection("payments").doc(session.id);
      const snap = await docRef.get();
      if (!snap.exists) {
        await docRef.set({
          session_id: session.id,
          amount_total: session.amount_total ?? null,
          currency: session.currency ?? null,
          customer_email: session.customer_details?.email ?? null,
          payment_status: session.payment_status ?? null,
          created_at: new Date(),
        });
        console.log("[FIRESTORE WRITE] payments/" + session.id);
      } else {
        console.log("[FIRESTORE SKIP] already exists: " + session.id);
      }
    }
  } catch (err: any) {
    console.error("WEBHOOK HANDLE ERROR", err?.message);
    // yine de 200 dönelim; Stripe tekrar dener ama log'u görürüz
  }

  return NextResponse.json({ received: true });
}

// App Router'da bodyParser kapatma gerekmez; config sadece Pages Router içindi.
// export const config = { api: { bodyParser: false } }  // <-- GEREK YOK

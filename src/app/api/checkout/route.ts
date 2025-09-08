import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), { status: 500 });
    }

    const stripe = new Stripe(secret);
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    // YOL A kullanıyorsan (JSON geliyorsa) aç:
    // const { quantity = 1 } = await req.json().catch(() => ({ quantity: 1 }));
    // YOL B kullanıyorsan (boş POST), JSON okuma yok:
    const quantity = 1;

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing NEXT_PUBLIC_STRIPE_PRICE_ID" }), { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity }],
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
    });

    return new Response(JSON.stringify({ id: session.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), { status: 500 });
  }
}

import Stripe from "stripe";

export const runtime = "nodejs"; // server-side; güvenle secret kullan

type Q = { session_id?: string };

export default async function Success({
  searchParams,
}: {
  // Next 15: searchParams artık Promise
  searchParams: Promise<Q>;
}) {
  const { session_id: sid } = await searchParams;

  let summary: {
    email?: string | null;
    amount_total?: number | null;
    currency?: string | null;
  } | null = null;

  if (sid) {
    const stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY! /* , { apiVersion: "2024-06-20" } */,
    );
    const session = await stripe.checkout.sessions.retrieve(sid, {
      expand: ["customer_details", "total_details"],
    });
    summary = {
      email: session.customer_details?.email ?? null,
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
    };
  }

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-semibold">Payment Success 🎉</h2>

        {!sid && <p className="text-gray-600">No session was provided.</p>}

        {summary && (
          <div className="inline-block text-left text-sm bg-white/70 rounded-xl p-4 shadow">
            <div>
              <b>Email:</b> {summary.email ?? "-"}
            </div>
            <div>
              <b>Total:</b>{" "}
              {summary.amount_total != null
                ? `${(summary.amount_total / 100).toFixed(2)} ${summary.currency?.toUpperCase()}`
                : "-"}
            </div>
          </div>
        )}

        <p className="text-gray-500">
          Check Firestore <code>payments</code> (doc id ={" "}
          <code>session.id</code>).
        </p>
      </div>
    </main>
  );
}

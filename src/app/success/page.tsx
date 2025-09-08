// /app/success/page.tsx
import Stripe from "stripe";
export default async function Success({ searchParams }: { searchParams: { session_id?: string } }) {
  const sid = searchParams.session_id;
  let summary: any = null;
  if (sid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const s = await stripe.checkout.sessions.retrieve(sid);
    summary = { amount: s.amount_total, currency: s.currency, email: s.customer_details?.email };
  }
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Ödeme Başarılı 🎉</h1>
        {summary ? (
          <p>{summary.email} • {(summary.amount! / 100).toFixed(2)} {summary.currency?.toUpperCase()}</p>
        ) : (
          <p>Özet bulunamadı ama ödeme tamamlandı.</p>
        )}
      </div>
    </main>
  );
}

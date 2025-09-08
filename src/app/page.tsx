"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [pub, setPub] = useState<string | undefined>(undefined);

  useEffect(() => {
    setPub(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    console.log("PUB KEY:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }, []);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Checkout error");

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe?.redirectToCheckout({ sessionId: data.id });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="max-w-xl w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">MatchMade — Stripe Test</h1>
        <p className="opacity-80">
          Test kartı: <code>4242 4242 4242 4242</code> • Gelecek tarih • CVC 123 • Postcode 12345
        </p>

        <button
          onClick={handleCheckout}
          disabled={loading || !pub}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Yönlendiriliyor..." : "MatchMade Ticket Satın Al (9.90 CAD)"}
        </button>

        {!pub && (
          <p className="text-sm text-red-500">
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY bulunamadı. .env.local ve restart kontrol et.
          </p>
        )}
      </div>
    </main>
  );
}

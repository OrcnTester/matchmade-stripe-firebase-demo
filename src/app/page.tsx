/* eslint-disable @next/next/no-html-link-for-pages */
export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  // Next 15 dynamic API: await the Promise
  const sp = (await searchParams) ?? {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const v = sp.view;
  //const view = Array.isArray(v) ? v[0] : v ?? "default";

  return (
    <main className="space-y-16 pb-24">
      {/* HERO */}
      <section className="text-center px-4 py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block rounded-full border px-3 py-1 text-xs font-semibold text-purple-700 bg-white">
            MVP • Next.js 15 • Firebase • Stripe
          </span>

          <h1 className="mt-6 text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            Meet. Match. <span className="text-purple-600">Make Memories.</span>
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            MatchMade connects people at cafés & restaurants with a playful
            digital matchmaking experience. Discover events, buy tickets,
            answer a quick survey, and see your top matches in real time.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="/events" className="rounded-xl bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700">
              🎟 View Events
            </a>
            <a href="/survey" className="rounded-xl border px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50">
              🧩 Take Survey
            </a>
            <a href="/matches" className="rounded-xl border px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50">
              💘 My Matches
            </a>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Pilot demo: Stripe sandbox, data in Firestore.
          </p>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <Card
            title="🎯 Clear User Journey"
            desc="Discovery → Checkout → Survey → Matches → QR Check-in. Laser-focused MVP flow."
          />
          <Card
            title="⚙️ Proactive Engineering"
            desc="Type safety, minimal deps, SSR/CSR boundaries, safe env handling. Ship small, ship often."
          />
          <Card
            title="🧪 Observable by Design"
            desc="Webhook logs, Firestore collections, friendly error states, and pragmatic fallbacks."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center md:text-left">How it works</h2>
          <ol className="mt-6 grid md:grid-cols-4 gap-4 text-left">
            <Step no="1" title="Browse Events" desc="Only published events are listed. Open details to proceed." />
            <Step no="2" title="Secure Checkout" desc="Stripe Checkout handles payment; you’re redirected on success." />
            <Step no="3" title="Quick Survey" desc="Answer Likert-scale questions to build your preference vector." />
            <Step no="4" title="Live Matching" desc="See your top 3 matches; at door, show your QR for swift entry." />
          </ol>
        </div>
      </section>

      {/* TECH / PRINCIPLES */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Tech Stack</h3>
            <ul className="mt-4 space-y-2 text-gray-700 text-sm">
              <li>• <b>Next.js 15</b> (App Router) • <b>React 19</b> • <b>Tailwind v4</b></li>
              <li>• <b>Firebase</b>: Auth, Firestore (client), Admin SDK (server)</li>
              <li>• <b>Stripe Checkout</b> + Webhooks (signature verification)</li>
              <li>• <b>Rules</b>: admin allowlist, “published only” public reads</li>
              <li>• <b>Matching</b>: cosine similarity with concise explanations</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Delivery Principles</h3>
            <ul className="mt-4 space-y-2 text-gray-700 text-sm">
              <li>• <b>Ship small, ship often</b>: 4-day MVP cadence & feature gating</li>
              <li>• <b>Type safety</b> & lint rules: ban `any`, keep interfaces lean</li>
              <li>• <b>Observability</b>: webhook logs, audit-friendly collections</li>
              <li>• <b>Security</b>: admin-only writes, signed webhooks, no client secrets</li>
              <li>• <b>Maintainability</b>: readable structure, README & env docs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className="max-w-3xl mx-auto text-center rounded-2xl border bg-white p-10 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900">Ready for pilot? 🚀</h3>
          <p className="mt-2 text-gray-600">
            Create an event, publish it, and run through Stripe test checkout.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a href="/events" className="rounded-xl bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700">
              🎟 View Events
            </a>
            <a href="/admin/events" className="rounded-xl border px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50">
              🛠 Admin Panel
            </a>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Note: Admin links require an allowlisted email to access.
          </p>
        </div>
      </section>
    </main>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 text-left shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{desc}</p>
    </div>
  );
}

function Step({ no, title, desc }: { no: string; title: string; desc: string }) {
  return (
    <li className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white text-sm font-bold">
          {no}
        </span>
        <span className="text-sm font-semibold text-gray-900">{title}</span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </li>
  );
}

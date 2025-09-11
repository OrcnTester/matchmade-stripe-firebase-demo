import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvent, type EventDoc } from "@/lib/eventsRepo";

export const dynamic = "force-dynamic";

export default async function EventDetailPage(
  props: { params: Promise<{ id: string }> }  // ← params artık Promise
) {
  const { id } = await props.params;           // ← await et
  const ev: EventDoc | null = await getEvent(id);
  if (!ev || ev.status !== "published") return notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{ev.title}</h1>
      <div className="text-sm text-gray-600">
        {new Date(ev.date).toLocaleString()} · {ev.location} · $
        {(ev.priceCents / 100).toFixed(2)}
      </div>
      {ev.description && <p className="text-sm">{ev.description}</p>}

      <form action="/api/checkout" method="POST" className="mt-4">
        <input type="hidden" name="eventId" value={ev.id} />
        <button className="rounded bg-black px-4 py-2 text-white">Buy ticket</button>
      </form>

      <Link className="text-sm underline" href="/events">Back to events</Link>
    </div>
  );
}

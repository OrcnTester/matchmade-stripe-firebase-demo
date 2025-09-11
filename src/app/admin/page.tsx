"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin-guard";
import { listEvents, updateEventStatus, type EventDoc } from "@/lib/eventsRepo";
import Button from "@/components/ui/button";

type Filter = "all" | "published" | "draft";

function StatusBadge({ status }: { status: "published" | "draft" }) {
  const cls =
    status === "published"
      ? "inline-flex items-center rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium"
      : "inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-medium";
  return (
    <span className={cls}>
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

export default function AdminEventsListPage() {
  const [items, setItems] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all"); // ← ayrım burada
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await listEvents();
      // admin listesinde daha anlamlı olsun diye tarihe göre sırala (yakın tarih üste)
      data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setItems(data);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let arr = items;
    if (filter !== "all") arr = arr.filter((e) => e.status === filter);
    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter(
        (e) =>
          e.title.toLowerCase().includes(s) ||
          e.location.toLowerCase().includes(s) ||
          e.description?.toLowerCase().includes(s),
      );
    }
    return arr;
  }, [items, filter, q]);

  async function toggle(id: string, current: "draft" | "published") {
    const next = current === "published" ? "draft" : "published";
    // optimistic update
    setItems((arr) =>
      arr.map((e) => (e.id === id ? { ...e, status: next } : e)),
    );
    try {
      await updateEventStatus(id, next);
      // burada istersen Firestore'dan yeniden fetch edebilirsin
    } catch (err) {
      // revert
      setItems((arr) =>
        arr.map((e) => (e.id === id ? { ...e, status: current } : e)),
      );
      console.error("[admin] status update failed:", err);
      alert("Status update failed");
    }
  }

  return (
    <AdminGuard>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Events</h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          />
          <Link href="/admin/events/new">
            <Button>Create</Button>
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-3 inline-flex rounded-lg border bg-white">
        {(["all", "published", "draft"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={
              "px-3 py-1.5 text-sm " +
              (filter === key
                ? "bg-black text-white rounded-lg"
                : "text-gray-700 hover:bg-gray-100")
            }
          >
            {key === "all"
              ? "All"
              : key === "published"
                ? "Published"
                : "Draft"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-600">No events.</div>
      ) : (
        <ul className="rounded border bg-white divide-y">
          {filtered.map((e) => (
            <li
              key={e.id}
              className="p-3 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium truncate">{e.title}</div>
                  <StatusBadge status={e.status} />
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(e.date).toLocaleString()} · {e.location} · $
                  {(e.priceCents / 100).toFixed(2)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={e.status === "published"}
                    onChange={() => toggle(e.id, e.status)}
                  />
                  {e.status === "published" ? "Published" : "Draft"}
                </label>

                <Link href={`/admin/events/${e.id}`}>
                  <Button variant="secondary" className="h-8 px-3 text-sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminGuard>
  );
}

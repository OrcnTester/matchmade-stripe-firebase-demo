"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminGuard from "@/components/admin-guard";
import {
  getEvent,
  updateEvent,
  removeEvent,
  type EventDoc,
} from "@/lib/eventsRepo";
import Button from "@/components/ui/button";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();
  const [form, setForm] = useState<Partial<EventDoc> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const ev = await getEvent(id);
      setForm(ev ?? null);
      setLoading(false);
    })();
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    try {
      await updateEvent(id, form);
      r.push("/admin/events");
    } catch (err) {
      console.error("[edit-event] update failed:", err);
      alert("Failed to update event");
    }
  }

  async function del() {
    if (!confirm("Delete this event?")) return;
    try {
      await removeEvent(id);
      r.push("/admin/events");
    } catch (err) {
      console.error("[edit-event] delete failed:", err);
      alert("Failed to delete event");
    }
  }

  if (loading) return <div>Loading…</div>;
  if (!form) return <div>Event not found</div>;

  return (
    <AdminGuard>
      <h1 className="text-2xl font-semibold mb-4">Edit Event</h1>
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            value={form.title ?? ""}
            onChange={(e) => setForm((f) => ({ ...f!, title: e.target.value }))}
            className="mt-1 w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="datetime-local"
            value={form.date ?? ""}
            onChange={(e) => setForm((f) => ({ ...f!, date: e.target.value }))}
            className="mt-1 w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            value={form.location ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f!, location: e.target.value }))
            }
            className="mt-1 w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price (CAD cents)</label>
          <input
            type="number"
            value={form.priceCents ?? 0}
            onChange={(e) =>
              setForm((f) => ({ ...f!, priceCents: Number(e.target.value) }))
            }
            className="mt-1 w-full rounded border p-2"
            min={0}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f!, description: e.target.value }))
            }
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        {/* Status dropdown */}
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            value={form.status ?? "draft"}
            onChange={(e) =>
              setForm((f) => ({
                ...f!,
                status: e.target.value as "draft" | "published",
              }))
            }
            className="mt-1 w-full rounded border p-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="destructive" onClick={del}>
            Delete
          </Button>
        </div>
      </form>
    </AdminGuard>
  );
}

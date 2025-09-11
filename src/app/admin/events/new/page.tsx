"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/admin-guard";
import { createEvent } from "@/lib/eventsRepo";
import Button from "@/components/ui/button";

export default function NewEventPage() {
  const r = useRouter();
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    priceCents: 0,
    description: "",
    status: "draft" as "draft" | "published",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createEvent(form);
      r.push("/admin/events");
    } catch (err) {
      console.error("[new-event] create failed:", err);
      alert("Failed to create event");
    }
  }

  return (
    <AdminGuard>
      <h1 className="text-2xl font-semibold mb-4">New Event</h1>
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="mt-1 w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="mt-1 w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
            className="mt-1 w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price (CAD cents)</label>
          <input
            type="number"
            value={form.priceCents}
            onChange={(e) =>
              setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))
            }
            className="mt-1 w-full rounded border p-2"
            min={0}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        {/* Status dropdown */}
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as "draft" | "published",
              }))
            }
            className="mt-1 w-full rounded border p-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <Button type="submit">Save</Button>
      </form>
    </AdminGuard>
  );
}

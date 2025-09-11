"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

type PublicEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  priceCents: number;
  status: "draft" | "published";
  description?: string;
};

export default function PublicEventsList() {
  const [items, setItems] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "events"),
      where("status", "==", "published"),
      orderBy("date", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PublicEvent, "id">),
      }));
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="text-sm text-gray-600">Loading…</div>;

  return (
    <ul className="grid gap-3">
      {items.map((e) => (
        <li key={e.id} className="rounded border bg-white p-4">
          <div className="font-medium">{e.title}</div>
          <div className="text-xs text-gray-500">
            {new Date(e.date).toLocaleString()} · {e.location} · $
            {(e.priceCents / 100).toFixed(2)}
          </div>
          <Link
            href={`/events/${e.id}`}
            className="inline-block mt-2 text-sm underline"
          >
            View details
          </Link>
        </li>
      ))}
    </ul>
  );
}

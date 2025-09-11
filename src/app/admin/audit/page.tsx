"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import AdminGuard from "@/components/admin-guard";

type Payment = {
  id: string;
  sessionId: string;
  eventId: string;
  userId: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  createdAt: Timestamp;
};

type Ticket = {
  id: string;
  eventId: string;
  userId: string;
  used?: boolean;
  usedAt?: Timestamp;
  status?: string;
  createdAt?: Timestamp;
};

export default function AuditPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(collection(db, "payments"), orderBy("createdAt", "desc"), limit(20)),
      (snap) => {
        setPayments(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, "id">) }))
        );
      }
    );
    const unsub2 = onSnapshot(
      query(collection(db, "tickets"), orderBy("createdAt", "desc"), limit(20)),
      (snap) => {
        setTickets(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Ticket, "id">) }))
        );
      }
    );
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  return (
    <AdminGuard>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Audit / Logs</h1>

        {/* Payments */}
        <section>
          <h2 className="text-xl font-medium mb-2">Latest Payments</h2>
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">Session</th>
                  <th className="px-2 py-1 text-left">Event</th>
                  <th className="px-2 py-1">User</th>
                  <th className="px-2 py-1">Amount</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Time</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-2 py-1">{p.sessionId.slice(0, 8)}…</td>
                    <td className="px-2 py-1">{p.eventId}</td>
                    <td className="px-2 py-1">{p.userId}</td>
                    <td className="px-2 py-1">
                      {(p.amountTotal / 100).toFixed(2)} {p.currency.toUpperCase()}
                    </td>
                    <td className="px-2 py-1">{p.paymentStatus}</td>
                    <td className="px-2 py-1">
                      {p.createdAt?.toDate().toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tickets */}
        <section>
          <h2 className="text-xl font-medium mb-2">Latest Tickets</h2>
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">Ticket</th>
                  <th className="px-2 py-1">Event</th>
                  <th className="px-2 py-1">User</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Used At</th>
                  <th className="px-2 py-1">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-2 py-1">{t.id.slice(0, 8)}…</td>
                    <td className="px-2 py-1">{t.eventId}</td>
                    <td className="px-2 py-1">{t.userId}</td>
                    <td className="px-2 py-1">
                      {t.status || (t.used ? "used" : "new")}
                    </td>
                    <td className="px-2 py-1">
                      {t.usedAt ? t.usedAt.toDate().toLocaleString() : "-"}
                    </td>
                    <td className="px-2 py-1">
                      {t.createdAt ? t.createdAt.toDate().toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminGuard>
  );
}

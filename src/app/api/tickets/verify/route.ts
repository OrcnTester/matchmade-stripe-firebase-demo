// src/app/api/tickets/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TicketStatus = "new" | "used" | "pending";
type Ticket = { secret: string; status: TicketStatus; eventId: string };

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const secret = req.nextUrl.searchParams.get("secret");
  if (!id || !secret) return NextResponse.json({ ok: false, error: "Missing params" }, { status: 400 });

  const snap = await adb.collection("tickets").doc(id).get();
  if (!snap.exists) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const t = snap.data() as Ticket | undefined;
  if (!t) return NextResponse.json({ ok: false, error: "Malformed ticket data" }, { status: 500 });
  if (t.secret !== secret) return NextResponse.json({ ok: false, error: "Secret mismatch" }, { status: 403 });
  if (t.status === "used") return NextResponse.json({ ok: false, error: "Already used" }, { status: 409 });

  return NextResponse.json({ ok: true, id, secret, eventId: t.eventId, status: t.status });
}

// src/app/api/tickets/redeem/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TicketStatus = "new" | "used" | "pending";
type Ticket = { secret: string; status: TicketStatus; eventId: string; usedAt?: number };
type RedeemBody = { id: string; secret: string };

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<RedeemBody> | null;
  if (!body?.id || !body?.secret) return NextResponse.json({ ok: false, error: "Missing body" }, { status: 400 });

  const ref = adb.collection("tickets").doc(body.id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const t = snap.data() as Ticket | undefined;
  if (!t) return NextResponse.json({ ok: false, error: "Malformed ticket" }, { status: 500 });
  if (t.secret !== body.secret) return NextResponse.json({ ok: false, error: "Secret mismatch" }, { status: 403 });
  if (t.status === "used") return NextResponse.json({ ok: false, error: "Already used" }, { status: 409 });

  await ref.update({ status: "used", usedAt: Date.now() });
  return NextResponse.json({ ok: true });
}

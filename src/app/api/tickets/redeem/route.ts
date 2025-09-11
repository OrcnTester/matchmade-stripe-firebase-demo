import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth as clientAuth } from "@/lib/firebase"; // sadece tip, kullanılmayacak
import { getApps } from "firebase/app";

// Basit admin kontrolü: Firebase client auth cookie’si yoksa, bu MVP’de
// request'ı admin guard'dan gönderdik varsayıyoruz. Daha sağlamı: 
// ID token'ı header ile gönder, Admin check yap.
// Şimdilik basit bırakıyoruz (MVP).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { id?: string; secret?: string } | null;
  if (!body?.id || !body?.secret) return NextResponse.json({ ok: false, error: "Missing body" }, { status: 400 });

  const ref = doc(db, "tickets", body.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const t = snap.data() as any;
  if (t.secret !== body.secret) return NextResponse.json({ ok: false, error: "Secret mismatch" }, { status: 403 });
  if (t.status === "used") return NextResponse.json({ ok: false, error: "Already used" }, { status: 409 });

  await updateDoc(ref, {
    status: "used",
    usedAt: Date.now(),
    // usedBy: (daha sonra admin email/uid ekleriz)
  });

  return NextResponse.json({ ok: true });
}

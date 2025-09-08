// src/app/api/admin-test/route.ts  (ve webhook/route.ts aynı)
import { NextRequest } from "next/server";
import * as admin from "firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServiceAccount(): admin.ServiceAccount {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();

  if (b64) {
    // 1) base64 -> utf8
    let decoded = Buffer.from(b64, "base64").toString("utf8");
    // 2) BOM temizle + trim
    decoded = decoded.replace(/^\uFEFF/, "").trim();
    // 3) Bazı durumlarda .env’e yanlışlıkla tırnakla yapıştırılıyor:
    if (decoded.startsWith('"') && decoded.endsWith('"')) {
      // dış tırnakları at + içte kaçışları düzelt
      decoded = decoded.slice(1, -1).replace(/\\"/g, '"');
    }
    // 4) Artık JSON parse güvenli
    const parsed = JSON.parse(decoded);
    if (typeof parsed.client_email !== "string" || typeof parsed.private_key !== "string") {
      throw new Error("Service account JSON missing 'client_email' or 'private_key'");
    }
    return parsed;
  }

  if (json) {
    const parsed = JSON.parse(json);
    if (typeof parsed.client_email !== "string" || typeof parsed.private_key !== "string") {
      throw new Error("Service account JSON missing 'client_email' or 'private_key'");
    }
    return parsed;
  }

  throw new Error("Missing Firebase service account (BASE64 or KEY)");
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(getServiceAccount()) });
}
const db = admin.firestore();

export async function GET(_req: NextRequest) {
  const id = `test_${Date.now()}`;
  await db.collection("payments").doc(id).set({
    ping: "pong",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });
  return new Response(JSON.stringify({ ok: true, id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

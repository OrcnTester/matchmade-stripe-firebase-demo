import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";

/**
 * Admin SDK init sırası:
 * 1) ENV: FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 * 2) ENV: FIREBASE_SERVICE_ACCOUNT_JSON (BASE64, tüm JSON'u içerir)
 * 3) ENV: FIREBASE_SERVICE_ACCOUNT_PATH (dosya yolu, örn: ./serviceAccountKey.json)
 *
 * Not: require() kullanmıyoruz, böylece @typescript-eslint/no-require-imports susar.
 */
function init() {
  if (getApps().length) return;

  const pid = process.env.FIREBASE_PROJECT_ID;
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  const key = process.env.FIREBASE_PRIVATE_KEY;

  // 1) Vercel/prod tipik kurulum (ENV ile)
  if (pid && email && key) {
    initializeApp({
      credential: cert({
        projectId: pid,
        clientEmail: email,
        privateKey: key.replace(/\\n/g, "\n"),
      } as ServiceAccount),
    });
    return;
  }

  // 2) Tek ENV ile (BASE64 JSON)
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (b64) {
    const raw = Buffer.from(b64, "base64").toString("utf8");
    const sa = JSON.parse(raw) as ServiceAccount;
    initializeApp({ credential: cert(sa) });
    return;
  }

  // 3) Dosya yolu ile (lokal geliştirme)
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path && fs.existsSync(path)) {
    const raw = fs.readFileSync(path, "utf8");
    const sa = JSON.parse(raw) as ServiceAccount;
    initializeApp({ credential: cert(sa) });
    return;
  }

  // Hiçbiri yoksa yönlendirici uyarı (log'da görünsün)
  console.warn(
    "[firebaseAdmin] Admin SDK init edilemedi. ENV'leri veya FIREBASE_SERVICE_ACCOUNT_PATH ayarla.",
  );
}

init();
export const adminDb = getFirestore();

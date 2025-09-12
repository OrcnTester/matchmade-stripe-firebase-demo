// src/lib/firebaseAdmin.ts
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = getApps().length
  ? getApps()[0]
  : initializeApp(
      process.env.FIREBASE_SERVICE_ACCOUNT
        ? { credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)) }
        : { credential: applicationDefault() }
    );

export const adb = getFirestore(app);

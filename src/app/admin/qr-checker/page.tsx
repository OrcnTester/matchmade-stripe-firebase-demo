"use client";
import AdminGuard from "@/components/admin-guard"; // <-- EKLE
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import type { Html5QrcodeScanner } from "html5-qrcode";

type CheckStatus = { ok: boolean; msg: string };

interface QrPayload {
  ticketId?: string;
  v?: number;
}

// Timestamp mı? (client SDK)
function isFirestoreTimestamp(x: unknown): x is Timestamp {
  return typeof x === "object" && x !== null && "toDate" in x && typeof (x as { toDate?: unknown }).toDate === "function";
}

// Timestamp | Date | null -> Date | null
function toDateSafe(x: unknown): Date | null {
  if (x instanceof Date) return x;
  if (isFirestoreTimestamp(x)) return x.toDate();
  return null;
}

export default function QrCheckerPage() {
  const divId = "qr-reader";
  const [decoded, setDecoded] = useState<string>("");
  const [status, setStatus] = useState<CheckStatus | null>(null);
  const started = useRef<boolean>(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const mod = (await import("html5-qrcode")) as typeof import("html5-qrcode");
        const Scanner = mod.Html5QrcodeScanner;
        const scanner = new Scanner(divId, { fps: 10, qrbox: 250 }, false);
        scannerRef.current = scanner;

        scanner.render(
          async (decodedText: string) => {
            setDecoded(decodedText);

            let payload: QrPayload;
            try {
              payload = JSON.parse(decodedText) as QrPayload;
            } catch {
              setStatus({ ok: false, msg: "Invalid QR payload (not JSON)" });
              return;
            }

            const ticketId = payload.ticketId ?? "";
            if (!ticketId) {
              setStatus({ ok: false, msg: "Invalid payload: ticketId missing" });
              return;
            }

            const ref = doc(db, "tickets", ticketId);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
              setStatus({ ok: false, msg: "Ticket not found" });
              return;
            }

            const data = snap.data() as {
              used?: boolean;
              usedAt?: Timestamp | Date | null;
            };

            if (data.used) {
              const ts = toDateSafe(data.usedAt);
              setStatus({
                ok: false,
                msg: `Already used${ts ? ` at ${ts.toLocaleString()}` : ""}`,
              });
              return;
            }

            await updateDoc(ref, {
              used: true,
              usedAt: new Date(),
              usedBy: "admin-qr-checker",
              status: "used",
            });

            setStatus({ ok: true, msg: "VALID ticket — check-in completed ✅" });
          }
          // onScanFailure parametresini tanımlamadık, no-unused-vars uyarısı da gelmez
        );
      } catch (e) {
        console.error("[qr-checker] init fail:", e);
        setStatus({ ok: false, msg: "Camera init failed" });
      }
    })();

    return () => {
      (async () => {
        try {
          await scannerRef.current?.clear();
        } catch {
          /* noop */
        }
        const holder = document.getElementById(divId);
        if (holder) holder.innerHTML = "";
      })();
    };
  }, []);

  return (
    <AdminGuard>
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">QR Checker</h1>
      <div id={divId} className="rounded border bg-white p-2" />
      {decoded && (
        <div className="rounded border p-3 text-sm">
          <div className="font-medium">Decoded</div>
          <pre className="whitespace-pre-wrap break-all">{decoded}</pre>
        </div>
      )}
      {status && (
        <div
          className={
            "rounded p-3 text-sm " +
            (status.ok ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200")
          }
        >
          {status.msg}
        </div>
      )}
    </div>
    </AdminGuard>
  );
}

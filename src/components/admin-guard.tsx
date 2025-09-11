"use client";
import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const list =
    (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && isAdminEmail(u.email)) setStatus("ok");
      else setStatus("denied");
    });
    return () => unsub();
  }, []);

  if (status === "loading") return <div className="text-sm text-gray-600">Checking admin…</div>;
  if (status === "denied")
    return (
      <div className="space-y-2">
        <div className="text-sm">You must be an admin to access this page.</div>
        <button
          className="rounded bg-black px-3 py-1.5 text-white"
          onClick={() => {
            // basitçe Google login açalım
            import("firebase/auth").then(async ({ GoogleAuthProvider, signInWithPopup }) => {
              try {
                await signInWithPopup(auth, new GoogleAuthProvider());
                location.reload();
              } catch (e) {
                console.error("login fail:", e);
              }
            });
          }}
        >
          Sign in as admin
        </button>
      </div>
    );

  return <>{children}</>;
}

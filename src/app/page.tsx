"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import PublicEventsList from "@/components/PublicEventsList";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const sp = useSearchParams();
  const r = useRouter();

  useEffect(() => {
    (async () => {
      if (sp.get("success") === "1" && sp.get("event")) {
        const user = auth.currentUser;
        if (!user) return; // login gerek
        const eventId = sp.get("event")!;
        const secret = crypto.randomUUID();

        const ref = await addDoc(collection(db, "tickets"), {
          eventId,
          userId: user.uid,
          secret,
          status: "valid",
          createdAt: Date.now(),
        });

        // temiz URL'e git (bilet sayfası)
        r.replace(`/ticket/${ref.id}`);
      }
    })();
  }, [sp, r]);

  // ... senin mevcut home içeriğin ...
  return (
    <div className="space-y-8">
       <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome to MatchMade</h1>
      <div>
        <h2 className="text-lg font-medium mb-2">Upcoming Events</h2>
        <PublicEventsList />
      </div>
    </div>
    </div>
  );
}

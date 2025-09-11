"use client";
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { AnswerMap, toVector, topMatches, explainMatch } from "@/lib/matching";
import { Card } from "@/components/ui/card";

const LABELS: Record<string, string> = {
  social_energy: "Sosyal enerji",
  spontaneity: "Spontanelik",
  conversation_depth: "Sohbet derinliği",
  humor: "Mizah",
  openness: "Açıklık",
  activity: "Aktivite tercihi",
  quiet: "Sakin ortam",
  group_size: "Grup boyutu",
  initiative: "İnisiyatif",
  punctual: "Dakiklik",
  foodie: "Kafe/restoran merakı",
  icebreakers: "Icebreaker toleransı",
};

export default function MatchesPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [mine, setMine] = useState<{ eventId?: string; answers?: AnswerMap } | null>(null);
  const [candidates, setCandidates] = useState<Array<{ id: string; displayName?: string; answers: AnswerMap }>>([]);
  const [loading, setLoading] = useState(true);

  const order = useMemo(() => Object.keys(LABELS), []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Tüm profilleri al (MVP basit yaklaşım)
        const snap = await getDocs(collection(db, "profiles"));
        type ProfileDoc = {
          answers?: AnswerMap;
          eventId?: string;
          displayName?: string;
          email?: string;
        };

        const items = snap.docs.map((d) => {
          const data = d.data() as ProfileDoc;
          return { id: d.id, ...data };
        });



        // benim profil
        const my = items.find((x) => x.id === uid) ?? null;
        setMine(my ? { eventId: my.eventId, answers: my.answers || {} } : null);

        // adaylar (ben hariç; eğer eventId varsa aynı eventtekiler)
        let pool = items.filter((x) => x.id !== uid && x.answers);
        if (my?.eventId) pool = pool.filter((x) => x.eventId === my.eventId);

        setCandidates(pool.map((x) => ({
          id: x.id,
          displayName: x.displayName || x.email || x.id.slice(0, 6),
          answers: x.answers as AnswerMap
        })));
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  if (loading) return <div className="text-sm text-gray-600">Loading matches…</div>;

  if (!mine?.answers || Object.keys(mine.answers).length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm">Henüz anket cevapların yok.</div>
        <a className="text-sm underline" href="/survey">Önce Survey’i doldur</a>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm">Şimdilik uygun aday bulunamadı.</div>
        <div className="text-xs text-gray-500">
          (Aynı etkinliği seçen başka katılımcılar geldikçe sonuçlar oluşur.)
        </div>
      </div>
    );
  }

  const meVec = toVector(mine.answers, order);
  const candVecs = candidates.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    vec: toVector(c.answers, order),
    answers: c.answers,
  }));

  const top = topMatches(meVec, candVecs, 3);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Your Top Matches</h1>
      <div className="text-xs text-gray-500">
        {mine.eventId ? `Etkinlik: ${mine.eventId} (aynı etkinlikteki adaylar)` : "Genel havuz"}
      </div>

      <ul className="grid gap-3">
        {top.map((m) => (
          <li key={m.id}>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold">{m.displayName ?? m.id}</div>
                <div className="text-sm text-gray-600">Similarity: {(m.score * 100).toFixed(1)}%</div>
              </div>
              <p className="text-sm mt-2 text-gray-700">
                {explainMatch(mine.answers!, m.answers!, order, LABELS)}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

type Question = {
  id: string;
  text: string;
};

const QUESTIONS: Question[] = [
  { id: "q1", text: "I enjoy meeting new people." },
  { id: "q2", text: "I prefer deep conversations over small talk." },
  { id: "q3", text: "I like spontaneous plans." },
  { id: "q4", text: "I feel energized in group settings." },
  { id: "q5", text: "I value structured activities." },
];

export default function SurveyPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | undefined>(undefined);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const r = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);
      // Örn. query param veya context’ten alabilirsin
      setEventId("demoEvent");
    }
    setLoading(false);
  }, []);

  // 🔹 Loading state gösterimi
  if (loading) {
    return <div className="text-sm text-gray-600">Loading survey…</div>;
  }

  async function handleSubmit() {
    if (!uid || !eventId) return;

    await setDoc(doc(db, "profiles", uid), {
      userId: uid,
      eventId,
      answers,
    });

    sessionStorage.setItem("mm_survey", JSON.stringify(Object.values(answers)));
    r.push("/matches");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Survey</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        {QUESTIONS.map((q) => (
          <div key={q.id} className="space-y-2">
            <label className="block text-sm font-medium">{q.text}</label>
            <select
              value={answers[q.id] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [q.id]: Number(e.target.value),
                }))
              }
              className="mt-1 block w-full rounded border p-2"
              required
            >
              <option value="" disabled>
                Select…
              </option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

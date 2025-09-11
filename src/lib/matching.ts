// src/lib/matching.ts
export type Vec = number[];
export type AnswerMap = Record<string, number>; // questionId -> 1..5

// Basit cosine
export function cosine(a: Vec, b: Vec): number {
  const dot = a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
  const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return na && nb ? dot / (na * nb) : 0;
}

export function toVector(answers: AnswerMap, order: string[]): Vec {
  return order.map((qid) => Math.max(1, Math.min(5, answers[qid] ?? 3)));
}

export function topMatches(
  me: Vec,
  candidates: { id: string; displayName?: string; vec: Vec; answers?: AnswerMap }[],
  k: number
) {
  return candidates
    .map((c) => ({ ...c, score: cosine(me, c.vec) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

// Basit açıklama: en çok örtüşen 3 boyutu söyler
export function explainMatch(
  myAnswers: AnswerMap,
  otherAnswers: AnswerMap,
  order: string[],
  labels: Record<string, string>
) {
  const diffs = order.map((qid) => ({
    qid, diff: Math.abs((myAnswers[qid] ?? 3) - (otherAnswers[qid] ?? 3))
  }));
  diffs.sort((a, b) => a.diff - b.diff);
  const top = diffs.slice(0, 3).map(d => labels[d.qid] ?? d.qid);
  return `Örtüşen yönler: ${top.join(", ")}.`;
}

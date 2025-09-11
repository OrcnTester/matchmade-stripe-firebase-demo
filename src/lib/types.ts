export type EventItem = {
  id: string;
  title: string;
  date: string; // ISO
  location: string;
  priceCents: number;
  description: string;
};
export type EventDoc = {
  id: string; // Firestore doc id
  title: string;
  date: string; // ISO (input için datetime-local ile uyumlu)
  location: string;
  priceCents: number; // integer, ör: 990
  description?: string;
};

export type SurveyAnswer = { qid: string; value: number }; // 1..5

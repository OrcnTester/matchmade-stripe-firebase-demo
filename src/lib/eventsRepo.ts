import { db } from "@/lib/firebase";
import {
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export type EventStatus = "draft" | "published";

export interface EventDoc {
  id: string;
  title: string;
  date: string; // ISO
  location: string;
  priceCents: number;
  description?: string;
  status: EventStatus; // <-- eklendi
  createdAt?: number;
  updatedAt?: number;
}

const col = () => collection(db, "events");

export async function listEvents(): Promise<EventDoc[]> {
  const snap = await getDocs(col());
  return snap.docs.map((d) => {
    const data = d.data() as Omit<EventDoc, "id"> & Partial<EventDoc>;
    return {
      id: d.id,
      title: data.title,
      date: data.date,
      location: data.location,
      priceCents: data.priceCents,
      description: data.description ?? "",
      status: (data.status as EventStatus) ?? "draft", // yoksa draft’a düş
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function getEvent(id: string): Promise<EventDoc | null> {
  const ref = doc(db, "events", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as Omit<EventDoc, "id"> & Partial<EventDoc>;
  return {
    id: snap.id,
    title: data.title,
    date: data.date,
    location: data.location,
    priceCents: data.priceCents,
    description: data.description ?? "",
    status: (data.status as EventStatus) ?? "draft",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function createEvent(
  payload: Omit<EventDoc, "id" | "createdAt" | "updatedAt">,
) {
  const docRef = await addDoc(col(), {
    ...payload,
    status: payload.status ?? "draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ts: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEvent(
  id: string,
  patch: Partial<Omit<EventDoc, "id">>,
) {
  const ref = doc(db, "events", id);
  await updateDoc(ref, { ...patch, updatedAt: Date.now() });
}

export async function removeEvent(id: string) {
  await deleteDoc(doc(db, "events", id));
}

/** Yalnızca status güncelleme (toggle için şık helper) */
export async function updateEventStatus(id: string, status: EventStatus) {
  await updateEvent(id, { status });
}
export async function listPublishedEvents(): Promise<EventDoc[]> {
  const q = query(
    col(),
    where("status", "==", "published"),
    orderBy("date", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Omit<EventDoc, "id">;
    return {
      id: d.id,
      title: data.title,
      date: data.date,
      location: data.location,
      priceCents: data.priceCents,
      description: data.description ?? "",
      status: (data.status as EventStatus) ?? "draft",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

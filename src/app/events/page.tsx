import PublicEventsList from "@/components/PublicEventsList";

export const dynamic = "force-dynamic"; // güvence için cache kapat

export default function EventsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Events</h1>
      <PublicEventsList />
    </div>
  );
}

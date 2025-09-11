import TicketClient from "@/components/TicketClient";

export const dynamic = "force-dynamic";

export default async function TicketPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; // Next 15: await şart
  return <TicketClient id={id} />;
}

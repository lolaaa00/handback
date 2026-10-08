import { MilestoneRoom } from "@/components/MilestoneRoom";
import { notFound } from "next/navigation";

export default async function MilestonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9][0-9]*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  return <MilestoneRoom id={Number(id)} />;
}

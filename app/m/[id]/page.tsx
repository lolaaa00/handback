import { MilestoneRoom } from "@/components/MilestoneRoom";

export default async function MilestonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MilestoneRoom id={Number(id)} />;
}


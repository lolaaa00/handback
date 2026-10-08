import { EvidenceReader } from "@/components/EvidenceReader";
import { notFound } from "next/navigation";

export default async function EvidencePage({ params }: { params: Promise<{ id: string; version: string }> }) {
  const { id, version } = await params;
  if (![id, version].every(value => /^[1-9][0-9]*$/.test(value) && Number.isSafeInteger(Number(value)))) notFound();
  return <EvidenceReader id={Number(id)} version={Number(version)} />;
}

import { EvidenceReader } from "@/components/EvidenceReader";

export default async function EvidencePage({ params }: { params: Promise<{ id: string; version: string }> }) {
  const { id, version } = await params;
  return <EvidenceReader id={Number(id)} version={Number(version)} />;
}


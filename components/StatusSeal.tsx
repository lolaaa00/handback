import { stateSentence } from "@/lib/format";

export function StatusSeal({ state }: { state: string }) {
  return <div className={`statusSeal state-${state.toLowerCase()}`}><span>{state.replaceAll("_", " ")}</span><p>{stateSentence(state)}</p></div>;
}


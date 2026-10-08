"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><main className="page narrow"><div className="emptyDesk error"><div className="eyebrow">Application error</div><h1>Handback could not finish this view.</h1><p>No contract state was changed. Retry the page or return after checking your connection.</p><button className="button primary" onClick={reset}>Try again</button></div></main></body></html>;
}

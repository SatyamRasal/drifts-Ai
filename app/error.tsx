'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border bg-white p-8 shadow-soft dark:bg-slate-950">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Error</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Something stopped the current action.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {error.message || 'The application caught the failure and can retry without exposing the internal stack.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={reset} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
            Try again
          </button>
          <Link href="/" className="rounded-2xl border px-5 py-3 text-sm font-medium">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

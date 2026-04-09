'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border bg-white p-8 shadow-soft dark:bg-slate-950">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Critical error</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">The application hit a fatal rendering error.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              This page is a final fallback so the app still returns a controlled experience instead of a blank screen.
            </p>
            <button
              onClick={() => reset()}
              className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Retry
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border bg-white p-8 shadow-soft dark:bg-slate-950">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">404</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          The page you requested does not exist or is no longer available.
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
          Go home
        </Link>
      </div>
    </div>
  );
}

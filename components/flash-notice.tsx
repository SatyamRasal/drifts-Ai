'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlashKind } from '@/lib/feedback';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

export function FlashNotice({
  kind,
  title,
  message,
}: {
  kind: FlashKind;
  title: string;
  message: string;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => setOpen(true), [title, message, kind]);
  if (!open) return null;

  const Icon = ICONS[kind];
  const tone =
    kind === 'error'
      ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
      : kind === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
        : 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200';

  return (
    <div className={cn('rounded-3xl border p-4 shadow-soft', tone)} role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-sm leading-6 opacity-90">{message}</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 transition hover:bg-black/5 dark:hover:bg-white/10" aria-label="Dismiss notification">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

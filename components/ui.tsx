import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode, HTMLAttributes } from 'react';

export function Button({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={cn(
        'ui-button inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60 bg-[color:var(--brand-accent)] text-white hover:opacity-90',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={cn(
        'ui-secondary-button inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn('ui-link-button inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition bg-[color:var(--brand-accent)] text-white hover:opacity-90', className)}>
      {children}
    </Link>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:bg-slate-900', props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:bg-slate-900', props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-slate-400 dark:bg-slate-900', props.className)} />;
}

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { className?: string; children: ReactNode }) {
  return <div {...props} className={cn('rounded-3xl border bg-white p-6 shadow-soft dark:bg-slate-950', className)}>{children}</div>;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-medium', className)}>{children}</span>;
}

export function LoadingSpinner() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}

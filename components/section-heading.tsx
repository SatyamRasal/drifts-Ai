export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="space-y-3">
      {eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{eyebrow}</div> : null}
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {description ? <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p> : null}
    </div>
  );
}

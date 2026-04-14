import { Badge, Card, LinkButton } from '@/components/ui';
import { FittedImage } from '@/components/fitted-image';
import { SectionHeading } from '@/components/section-heading';
import type { LandingBlock } from '@/lib/data';
import { ArrowRight, Sparkles } from 'lucide-react';

function parseLines(items: LandingBlock['items'] | undefined) {
  return items?.filter(Boolean) ?? [];
}

export function LandingBlocks({ blocks }: { blocks: LandingBlock[] }) {
  if (!blocks.length) return null;

  return (
    <div className="space-y-10">
      {blocks.map((block) => {
        const alignClass = block.align === 'center' ? 'text-center items-center mx-auto' : 'text-left';
        const backgroundClass =
          block.background === 'dark'
            ? 'bg-slate-950 text-white'
            : block.background === 'muted'
              ? 'bg-slate-100 dark:bg-slate-900'
              : block.background === 'accent'
                ? ''
                : 'bg-white dark:bg-slate-950';

        if (block.type === 'spacer') {
          return <div key={block.id} className="h-8" />;
        }

        if (block.type === 'text') {
          return (
            <section key={block.id} className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <Card className={`space-y-4 ${backgroundClass}`} style={block.background === 'accent' ? { background: 'var(--brand-accent-soft)' } : undefined}>
                {block.eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{block.eyebrow}</div> : null}
                {block.title ? <h2 className={`text-3xl font-semibold tracking-tight ${alignClass}`}>{block.title}</h2> : null}
                {block.body ? <p className={`max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 ${alignClass}`}>{block.body}</p> : null}
              </Card>
            </section>
          );
        }

        if (block.type === 'hero') {
          return (
            <section key={block.id} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
              <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                <div className={`space-y-6 ${alignClass}`}>
                  {block.eyebrow ? <Badge className="border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">{block.eyebrow}</Badge> : null}
                  <div className="space-y-4">
                    {block.title ? <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl xl:text-6xl">{block.title}</h1> : null}
                    {block.body ? <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{block.body}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {block.label && block.href ? (
                      <LinkButton href={block.href} className="gap-2 bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                        {block.label} <ArrowRight className="h-4 w-4" />
                      </LinkButton>
                    ) : null}
                  </div>
                </div>
                {block.media_url ? (
                  <Card className="relative overflow-hidden p-0">
                    <div className="p-4">
                      <FittedImage src={block.media_url} alt={block.title || 'Landing media'} aspectClassName="aspect-[16/10]" className="rounded-[1.5rem]" />
                    </div>
                  </Card>
                ) : null}
              </div>
            </section>
          );
        }

        if (block.type === 'image') {
          return (
            <section key={block.id} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div className="space-y-3">
                  {block.eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{block.eyebrow}</div> : null}
                  {block.title ? <h2 className="text-3xl font-semibold tracking-tight">{block.title}</h2> : null}
                  {block.body ? <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{block.body}</p> : null}
                </div>
                {block.media_url ? (
                  <FittedImage src={block.media_url} alt={block.title || 'Image section'} aspectClassName="aspect-[16/10]" className="rounded-[2rem] border shadow-soft" />
                ) : null}
              </div>
            </section>
          );
        }

        if (block.type === 'video') {
          return (
            <section key={block.id} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <Card className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div className="space-y-3">
                  {block.eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{block.eyebrow}</div> : null}
                  {block.title ? <h2 className="text-3xl font-semibold tracking-tight">{block.title}</h2> : null}
                  {block.body ? <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{block.body}</p> : null}
                  {block.label && block.href ? <LinkButton href={block.href} className="bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950">{block.label}</LinkButton> : null}
                </div>
                {block.media_url ? (
                  <div className="overflow-hidden rounded-[2rem] border bg-slate-950">
                    <iframe
                      src={block.media_url}
                      title={block.title || 'Video section'}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : null}
              </Card>
            </section>
          );
        }

        if (block.type === 'cta') {
          return (
            <section key={block.id} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <Card className="flex flex-col gap-4 bg-slate-950 text-white md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  {block.eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{block.eyebrow}</div> : null}
                  {block.title ? <div className="text-2xl font-semibold tracking-tight">{block.title}</div> : null}
                  {block.body ? <div className="max-w-2xl text-sm leading-7 text-slate-300">{block.body}</div> : null}
                </div>
                {block.label && block.href ? <LinkButton href={block.href} className="bg-white text-slate-950 hover:bg-slate-100">{block.label}</LinkButton> : null}
              </Card>
            </section>
          );
        }

        if (block.type === 'feature_grid') {
          const items = parseLines(block.items);
          return (
            <section key={block.id} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <SectionHeading eyebrow={block.eyebrow} title={block.title || 'Features'} description={block.body} />
              <div className="mt-8 grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(block.columns || 3, 4)}, minmax(0, 1fr))` }}>
                {items.map((item) => (
                  <Card key={`${block.id}-${item.title}`} className="space-y-3">
                    <Sparkles className="h-5 w-5" />
                    <div className="text-lg font-semibold">{item.title}</div>
                    <div className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item.text}</div>
                  </Card>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === 'stats') {
          const stats = block.stats ?? [];
          return (
            <section key={block.id} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <Card className="space-y-4 bg-slate-950 text-white">
                <SectionHeading eyebrow={block.eyebrow} title={block.title || 'Results'} description={block.body} />
                <div className="grid gap-4 md:grid-cols-3">
                  {stats.map((item) => (
                    <div key={`${block.id}-${item.label}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-2xl font-semibold">{item.value}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}

import { Badge, Card, LinkButton } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/data';

export function ProductCard({ product, basePath }: { product: Product; basePath: '/products' | '/upcoming' }) {
  return (
    <Card className="group relative overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="mb-5 overflow-hidden rounded-2xl border bg-slate-100 dark:bg-slate-900">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-56 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.3),_transparent_55%)] text-slate-500">No image yet</div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Badge className={product.kind === 'current' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300'}>
          {product.kind === 'current' ? 'Live' : 'Upcoming'}
        </Badge>
        {product.featured ? <Badge className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300"><Sparkles className="mr-1 h-3 w-3" /> Featured</Badge> : null}
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">{product.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{product.subtitle}</p>
        <p className="line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-400">{product.description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">Updated {formatDate(product.updated_at)}</div>
        <LinkButton href={`${basePath}/${product.slug}`} className="gap-2 bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
          Details <ArrowUpRight className="h-4 w-4" />
        </LinkButton>
      </div>
    </Card>
  );
}

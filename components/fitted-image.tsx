import { cn } from '@/lib/utils';

type FitMode = 'cover' | 'contain';

type FittedImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspectClassName?: string;
  fit?: FitMode;
  loading?: 'lazy' | 'eager';
};

export function FittedImage({
  src,
  alt,
  className,
  imgClassName,
  aspectClassName = 'aspect-[16/10]',
  fit = 'cover',
  loading = 'lazy',
}: FittedImageProps) {
  return (
    <div className={cn('overflow-hidden bg-slate-100 dark:bg-slate-900', aspectClassName, className)}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={cn('h-full w-full', fit === 'contain' ? 'object-contain' : 'object-cover', imgClassName)}
      />
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { MoonStar, SunMedium } from 'lucide-react';
import { SecondaryButton } from '@/components/ui';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <SecondaryButton type="button" className="gap-2 opacity-70" disabled>Theme</SecondaryButton>;

  const isDark = theme === 'dark';

  return (
    <SecondaryButton type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')} className="gap-2">
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </SecondaryButton>
  );
}

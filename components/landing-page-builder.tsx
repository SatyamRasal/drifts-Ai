'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Input, Select, Textarea, SecondaryButton } from '@/components/ui';
import type { LandingBlock, LandingBlockType } from '@/lib/data';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy } from 'lucide-react';

const EMPTY_BLOCK: LandingBlock = {
  id: 'block-1',
  type: 'text',
  eyebrow: 'Section',
  title: 'New section',
  body: 'Describe this section here.',
  background: 'surface',
  align: 'left',
  items: [],
  stats: [],
};

function createBlock(index: number): LandingBlock {
  return {
    ...EMPTY_BLOCK,
    id: `block-${index + 1}`,
    title: index === 0 ? 'Build your landing page' : `Section ${index + 1}`,
  };
}

function normalizeBlocks(blocks: LandingBlock[]) {
  return blocks.map((block, index) => ({
    id: block.id || `block-${index + 1}`,
    type: block.type || 'text',
    eyebrow: block.eyebrow || '',
    title: block.title || '',
    subtitle: block.subtitle || '',
    body: block.body || '',
    media_url: block.media_url || '',
    label: block.label || '',
    href: block.href || '',
    align: block.align || 'left',
    columns: block.columns || 3,
    background: block.background || 'surface',
    items: Array.isArray(block.items) ? block.items : [],
    stats: Array.isArray(block.stats) ? block.stats : [],
    caption: block.caption || '',
    autoplay: Boolean(block.autoplay),
    loop: Boolean(block.loop),
  }));
}

export function LandingPageBuilder({ name = 'landingBlocksJson', initialBlocks = [] }: { name?: string; initialBlocks?: LandingBlock[] }) {
  const [blocks, setBlocks] = useState<LandingBlock[]>(() => normalizeBlocks(initialBlocks.length ? initialBlocks : [createBlock(0)]));

  const serialized = useMemo(() => JSON.stringify(blocks), [blocks]);

  function updateBlock(index: number, patch: Partial<LandingBlock>) {
    setBlocks((current) => current.map((block, i) => (i === index ? { ...block, ...patch } : block)));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function duplicateBlock(index: number) {
    setBlocks((current) => {
      const clone = JSON.parse(JSON.stringify(current[index])) as LandingBlock;
      clone.id = `${clone.id}-copy-${Date.now().toString(36)}`;
      const next = [...current];
      next.splice(index + 1, 0, clone);
      return next;
    });
  }

  function removeBlock(index: number) {
    setBlocks((current) => current.length === 1 ? current : current.filter((_, i) => i !== index));
  }

  function addBlock(type: LandingBlockType = 'text') {
    setBlocks((current) => [...current, { ...createBlock(current.length), type }]);
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={serialized} />
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => addBlock('hero')}><Plus className="mr-2 h-4 w-4" />Hero</Button>
        <SecondaryButton type="button" onClick={() => addBlock('text')}><Plus className="mr-2 h-4 w-4" />Text</SecondaryButton>
        <SecondaryButton type="button" onClick={() => addBlock('image')}><Plus className="mr-2 h-4 w-4" />Image</SecondaryButton>
        <SecondaryButton type="button" onClick={() => addBlock('video')}><Plus className="mr-2 h-4 w-4" />Video</SecondaryButton>
        <SecondaryButton type="button" onClick={() => addBlock('cta')}><Plus className="mr-2 h-4 w-4" />CTA</SecondaryButton>
        <SecondaryButton type="button" onClick={() => addBlock('feature_grid')}><Plus className="mr-2 h-4 w-4" />Features</SecondaryButton>
        <SecondaryButton type="button" onClick={() => addBlock('stats')}><Plus className="mr-2 h-4 w-4" />Stats</SecondaryButton>
        <SecondaryButton type="button" onClick={() => addBlock('spacer')}><Plus className="mr-2 h-4 w-4" />Spacer</SecondaryButton>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <Card key={block.id} className="space-y-4 border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Section {index + 1}</div>
                <div className="text-xs text-slate-500">ID: {block.id}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <SecondaryButton type="button" onClick={() => moveBlock(index, -1)}><ArrowUp className="h-4 w-4" /></SecondaryButton>
                <SecondaryButton type="button" onClick={() => moveBlock(index, 1)}><ArrowDown className="h-4 w-4" /></SecondaryButton>
                <SecondaryButton type="button" onClick={() => duplicateBlock(index)}><Copy className="h-4 w-4" /></SecondaryButton>
                <SecondaryButton type="button" onClick={() => removeBlock(index)}><Trash2 className="h-4 w-4" /></SecondaryButton>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">Type</label>
                <Select value={block.type} onChange={(event) => updateBlock(index, { type: event.target.value as LandingBlockType })}>
                  <option value="hero">Hero</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="cta">CTA</option>
                  <option value="feature_grid">Feature grid</option>
                  <option value="stats">Stats</option>
                  <option value="spacer">Spacer</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">ID</label>
                <Input value={block.id} onChange={(event) => updateBlock(index, { id: event.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm">Eyebrow</label>
                <Input value={block.eyebrow || ''} onChange={(event) => updateBlock(index, { eyebrow: event.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm">Alignment</label>
                <Select value={block.align || 'left'} onChange={(event) => updateBlock(index, { align: event.target.value as 'left' | 'center' })}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Background</label>
                <Select value={block.background || 'surface'} onChange={(event) => updateBlock(index, { background: event.target.value as LandingBlock['background'] })}>
                  <option value="surface">Surface</option>
                  <option value="muted">Muted</option>
                  <option value="accent">Accent</option>
                  <option value="dark">Dark</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Columns</label>
                <Input type="number" min={1} max={4} value={block.columns || 3} onChange={(event) => updateBlock(index, { columns: Number(event.target.value || 3) })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">Title</label>
                <Input value={block.title || ''} onChange={(event) => updateBlock(index, { title: event.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">Subtitle</label>
                <Input value={block.subtitle || ''} onChange={(event) => updateBlock(index, { subtitle: event.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">Body</label>
                <Textarea rows={5} value={block.body || ''} onChange={(event) => updateBlock(index, { body: event.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm">Button label</label>
                <Input value={block.label || ''} onChange={(event) => updateBlock(index, { label: event.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm">Button href</label>
                <Input value={block.href || ''} onChange={(event) => updateBlock(index, { href: event.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">Media URL</label>
                <Input value={block.media_url || ''} onChange={(event) => updateBlock(index, { media_url: event.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">Caption</label>
                <Input value={block.caption || ''} onChange={(event) => updateBlock(index, { caption: event.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm">Autoplay</label>
                <Select value={String(Boolean(block.autoplay))} onChange={(event) => updateBlock(index, { autoplay: event.target.value === 'true' })}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Loop</label>
                <Select value={String(Boolean(block.loop))} onChange={(event) => updateBlock(index, { loop: event.target.value === 'true' })}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </div>
            </div>

            {block.type === 'feature_grid' ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Features</label>
                <Textarea
                  rows={4}
                  value={(block.items || []).map((item) => `${item.title} | ${item.text}`).join('\n')}
                  onChange={(event) =>
                    updateBlock(index, {
                      items: event.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                          const [title, ...rest] = line.split('|');
                          return { title: (title || '').trim(), text: rest.join('|').trim() };
                        }),
                    })
                  }
                />
                <div className="text-xs text-slate-500">Use one item per line: title | text</div>
              </div>
            ) : null}

            {block.type === 'stats' ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Stats</label>
                <Textarea
                  rows={4}
                  value={(block.stats || []).map((item) => `${item.label} | ${item.value}`).join('\n')}
                  onChange={(event) =>
                    updateBlock(index, {
                      stats: event.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                          const [label, ...rest] = line.split('|');
                          return { label: (label || '').trim(), value: rest.join('|').trim() };
                        }),
                    })
                  }
                />
                <div className="text-xs text-slate-500">Use one item per line: label | value</div>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}

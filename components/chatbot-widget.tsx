'use client';

import { useMemo, useState } from 'react';
import { Bot, ChevronDown, MessageSquareText, Send, Sparkles, X } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';

type ChatMessage = {
  role: 'assistant' | 'user';
  text: string;
};

type ChatbotWidgetProps = {
  enabled: boolean;
  brandName: string;
  greeting: string;
  defaultAnswer: string;
  suggestions: string[];
};

export function ChatbotWidget({ enabled, brandName, greeting, defaultAnswer, suggestions }: ChatbotWidgetProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: greeting || `Hi, I am the ${brandName} assistant.` },
  ]);

  const suggestionList = useMemo(() => suggestions.slice(0, 4), [suggestions]);

  if (!enabled) return null;

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setInput('');
    setMessages((current) => [...current, { role: 'user', text: trimmed }]);

    try {
      const response = await fetch('/api/chatbot/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, page: window.location.pathname }),
      });
      const payload = await response.json().catch(() => ({}));
      const answer = typeof payload.answer === 'string' && payload.answer.trim() ? payload.answer.trim() : defaultAnswer;
      setMessages((current) => [...current, { role: 'assistant', text: answer }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: defaultAnswer }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <Card className="mb-3 w-[min(92vw,24rem)] overflow-hidden border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="h-4 w-4" /> AI assistant
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Knowledge base + OpenAI fallback</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border p-2 text-slate-500 hover:text-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white" aria-label="Close chatbot">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[26rem] space-y-3 overflow-auto px-4 py-4 text-sm">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={message.role === 'user' ? 'max-w-[85%] rounded-2xl bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950' : 'max-w-[85%] rounded-2xl border px-4 py-3 text-slate-700 dark:border-slate-800 dark:text-slate-200'}>
                  {message.text}
                </div>
              </div>
            ))}

            {suggestionList.length ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Sparkles className="h-3.5 w-3.5" /> Suggested questions
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestionList.map((item) => (
                    <button key={item} type="button" onClick={() => void sendQuestion(item)} className="rounded-full border px-3 py-1.5 text-left text-xs text-slate-600 hover:border-slate-400 hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendQuestion(input);
            }}
            className="flex items-center gap-2 border-t p-3 dark:border-slate-800"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question…"
              className="flex-1"
              disabled={busy}
            />
            <Button type="submit" className="px-4" disabled={busy}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-3 text-sm font-medium shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
      >
        <MessageSquareText className="h-4 w-4" /> Chatbot
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}

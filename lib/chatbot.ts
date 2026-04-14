import { clampText, safeJsonParse } from '@/lib/utils';

export type ChatbotFaq = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  priority: number;
  enabled: boolean;
  source: 'manual' | 'sheet';
};

export type ChatbotRuntimeSettings = {
  chatbot_enabled: boolean;
  chatbot_welcome_message: string;
  chatbot_default_answer: string;
  chatbot_ai_enabled: boolean;
  chatbot_ai_model: string;
  chatbot_system_prompt: string;
  chatbot_openai_api_key?: string;
  chatbot_faqs: ChatbotFaq[];
};

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'i', 'in', 'is', 'it', 'of', 'on', 'or', 'our', 'the', 'to', 'what', 'when', 'where', 'which', 'who', 'why', 'with', 'you', 'your', 'can', 'could', 'do', 'does', 'did', 'this', 'that', 'please', 'tell', 'me', 'about', 'need', 'want', 'help', 'give', 'show', 'find', 'explain', 'my', 'we', 'us', 'they', 'them', 'there', 'would', 'should',
]);

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string) {
  return normalize(text)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token && !STOPWORDS.has(token));
}

function uniq(values: string[]) {
  return Array.from(new Set(values));
}

export function parseFaqList(value: unknown): ChatbotFaq[] {
  const rows = Array.isArray(value) ? value : safeJsonParse(String(value || '[]'), [] as unknown[]);
  return rows
    .map((row, index) => {
      if (!row || typeof row !== 'object') return null;
      const source = row as Record<string, unknown>;
      const question = String(source.question ?? source.q ?? '').trim();
      const answer = String(source.answer ?? source.a ?? '').trim();
      if (!question || !answer) return null;
      const id = String(source.id ?? `faq-${index + 1}`).trim() || `faq-${index + 1}`;
      const tags = uniq(
        Array.isArray(source.tags)
          ? source.tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
          : String(source.tags ?? '')
              .split(/[;,|]/g)
              .map((tag) => tag.trim().toLowerCase())
              .filter(Boolean),
      );
      const priority = Number(source.priority ?? source.rank ?? 0);
      const enabled = source.enabled === false || source.enabled === 'false' ? false : true;
      const sourceType = source.source === 'sheet' ? 'sheet' : 'manual';
      return { id, question, answer, tags, priority: Number.isFinite(priority) ? priority : 0, enabled, source: sourceType } satisfies ChatbotFaq;
    })
    .filter((item): item is ChatbotFaq => Boolean(item));
}

function overlapScore(aTokens: string[], bTokens: string[]) {
  if (!aTokens.length || !bTokens.length) return 0;
  const left = new Set(aTokens);
  const right = new Set(bTokens);
  let common = 0;
  for (const token of left) {
    if (right.has(token)) common += 1;
  }
  return common / Math.max(left.size, right.size);
}

function containsScore(question: string, reference: string) {
  const q = normalize(question);
  const r = normalize(reference);
  if (!q || !r) return 0;
  if (q === r) return 1;
  if (r.includes(q) || q.includes(r)) return 0.95;
  const qTokens = tokenize(question);
  const rTokens = tokenize(reference);
  const overlap = overlapScore(qTokens, rTokens);
  const tagOverlap = overlapScore(qTokens, rTokens.filter((token) => token.length > 2));
  return Math.max(overlap, tagOverlap);
}

export function pickBestFaq(question: string, faqs: ChatbotFaq[]) {
  const normalizedQuestion = normalize(question);
  if (!normalizedQuestion) return null;

  let best: { faq: ChatbotFaq; score: number } | null = null;
  const questionTokens = tokenize(question);

  for (const faq of faqs) {
    if (!faq.enabled) continue;
    const primary = containsScore(question, faq.question);
    const answerScore = containsScore(question, faq.answer);
    const tagScore = faq.tags.length ? overlapScore(questionTokens, faq.tags.flatMap((tag) => tokenize(tag))) : 0;
    const keywordScore = overlapScore(questionTokens, uniq([...tokenize(faq.question), ...faq.tags]));
    const score = Math.max(primary, answerScore * 0.4, tagScore * 0.55, keywordScore) + Math.min(0.15, Math.max(0, faq.priority) * 0.02);

    if (!best || score > best.score) {
      best = { faq, score };
    }
  }

  return best;
}

export function buildFallbackAnswer(settings: Pick<ChatbotRuntimeSettings, 'chatbot_default_answer'>, question: string) {
  const fallback = settings.chatbot_default_answer?.trim() || 'I could not match that question yet. Please rephrase it, or ask an admin to add it to the knowledge base.';
  return fallback.replaceAll('{question}', clampText(question.trim(), 140));
}

export async function askOpenAiChatbot(input: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  question: string;
  knowledge: ChatbotFaq[];
  defaultAnswer: string;
  page?: string;
}) {
  const inputText = [
    input.systemPrompt,
    '',
    `Question: ${input.question}`,
    input.page ? `Page: ${input.page}` : '',
    `Default fallback: ${input.defaultAnswer}`,
    input.knowledge.length ? 'Approved knowledge base:' : '',
    ...input.knowledge.map((item, index) => `${index + 1}. ${item.question} => ${item.answer}`),
  ]
    .filter(Boolean)
    .join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: input.model || 'gpt-4.1-mini',
      temperature: 0.2,
      max_output_tokens: 220,
      store: false,
      input: inputText,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `OpenAI request failed with status ${response.status}`);
  }

  const data = await response.json();
  const text = extractOpenAiText(data);
  return text.trim();
}

export function extractOpenAiText(data: any) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const pieces: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    if (item.type === 'message' && Array.isArray(item.content)) {
      for (const content of item.content) {
        if (content?.type === 'output_text' && typeof content.text === 'string') {
          pieces.push(content.text);
        }
        if (content?.type === 'text' && typeof content.text === 'string') {
          pieces.push(content.text);
        }
      }
    }
  }

  return pieces.join('\n').trim();
}

export function parseFaqSheetText(raw: string, source: 'manual' | 'sheet' = 'sheet') {
  const text = String(raw || '').trim();
  if (!text) return [] as ChatbotFaq[];

  const lines = text
    .replaceAll('\r\n', '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [] as ChatbotFaq[];

  const maybeHeader = lines[0].toLowerCase();
  const hasHeader = /question/.test(maybeHeader) && /answer/.test(maybeHeader);
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const separator: ',' | '|' | '\t' = dataLines.some((line) => line.includes('|')) ? '|' : dataLines.some((line) => line.includes('\t')) ? '\t' : ',';

  const parsed: ChatbotFaq[] = [];
  for (const [index, line] of dataLines.entries()) {
    const parts = splitDelimitedLine(line, separator);
    const question = String(parts[0] || '').trim();
    const answer = String(parts[1] || '').trim();
    if (!question || !answer) continue;
    const tags = String(parts[2] || '')
      .split(/[;,]/g)
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
    const priority = Number(String(parts[3] || '0').trim());
    const enabledRaw = String(parts[4] || 'true').trim().toLowerCase();
    parsed.push({
      id: `faq-${Date.now()}-${index}`,
      question,
      answer,
      tags: uniq(tags),
      priority: Number.isFinite(priority) ? priority : 0,
      enabled: !['0', 'false', 'no', 'off'].includes(enabledRaw),
      source,
    });
  }

  return parsed;
}

function splitDelimitedLine(line: string, separator: ',' | '|' | '\t') {
  const out: string[] = [];
  let current = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (!quoted && char === separator) {
      out.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }

  out.push(current.trim());
  return out;
}

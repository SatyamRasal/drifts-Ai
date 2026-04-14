import { NextResponse } from 'next/server';
import { getAdminSiteSettings } from '@/lib/data';
import { askOpenAiChatbot, buildFallbackAnswer, pickBestFaq } from '@/lib/chatbot';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const question = String(body.question || '').trim().slice(0, 500);
    const page = typeof body.page === 'string' ? body.page.slice(0, 120) : '';

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const settings = await getAdminSiteSettings();
    const faqs = settings.chatbot_faqs;
    const fallback = buildFallbackAnswer(settings, question);
    const best = pickBestFaq(question, faqs);

    if (best && best.score >= 0.34) {
      return NextResponse.json({
        answer: best.faq.answer,
        source: 'faq',
        matchedQuestion: best.faq.question,
        confidence: Number(best.score.toFixed(2)),
        fallback,
      });
    }

    if (settings.chatbot_ai_enabled && settings.chatbot_openai_api_key?.trim()) {
      try {
        const answer = await askOpenAiChatbot({
          apiKey: settings.chatbot_openai_api_key,
          model: settings.chatbot_ai_model,
          systemPrompt: settings.chatbot_system_prompt,
          question,
          knowledge: faqs.slice(0, 12),
          defaultAnswer: fallback,
          page,
        });

        if (answer) {
          return NextResponse.json({
            answer,
            source: 'ai',
            confidence: best ? Number(best.score.toFixed(2)) : 0,
            fallback,
          });
        }
      } catch (error) {
        console.error('Chatbot AI fallback failed:', error);
      }
    }

    return NextResponse.json({
      answer: fallback,
      source: 'fallback',
      confidence: best ? Number(best.score.toFixed(2)) : 0,
    });
  } catch (error) {
    console.error('Chatbot answer route failed:', error);
    return NextResponse.json({ error: 'Unable to answer right now' }, { status: 500 });
  }
}

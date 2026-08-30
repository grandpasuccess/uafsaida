// UAFSAIDA — Streaming Chat API Route
// Real-time AI responses via Server-Sent Events

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messages = [
            ...history.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: 'user', content: message },
          ];

          const stream = await client.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages,
          });

          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ text: chunk.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

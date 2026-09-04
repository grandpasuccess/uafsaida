// UAFSAIDA — AI Provider API
import { NextRequest, NextResponse } from 'next/server';
import { getAvailableProviders, createProvider, ProviderType } from '@/lib/ai-providers';

export async function GET() {
  const providers = getAvailableProviders();
  
  return NextResponse.json({
    providers,
    default: process.env.AI_PROVIDER || 'anthropic',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, prompt, options } = body;

    const aiProvider = createProvider(provider as ProviderType);
    const response = await aiProvider.generate(prompt, options);
    
    return NextResponse.json({ success: true, response });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

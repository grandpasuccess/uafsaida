// UAFSAIDA — WebSocket API Route
// Handles WebSocket upgrade requests

import { NextRequest } from 'next/server';
import { collaborationServer } from '@/lib/websocket';

export async function GET(request: NextRequest) {
  // This route is handled by the custom server
  // Return info about WebSocket availability
  return Response.json({
    websocket: {
      available: true,
      path: '/ws',
      protocols: ['json'],
    },
  });
}

// Note: WebSocket upgrade is handled in the custom server (server.ts)
// This route just provides info about the WebSocket endpoint

// UAFSAIDA — MSW API Mocks for Integration Tests
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'UAFSAIDA',
      checks: {
        database: { status: 'ok', latency: 0 },
        aiApi: { status: 'ok', latency: 0 },
        memory: { status: 'ok', heapUsed: '50MB', heapTotal: '100MB' },
        uptime: { status: 'ok', seconds: 3600 },
      },
    });
  }),

  http.get('/api/projects', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json({
      projects: [
        {
          id: 'proj-1',
          name: 'Test Project',
          description: 'A test project',
          status: 'draft',
          type: 'webapp',
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
    });
  }),

  http.post('/api/projects', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }
    const body = (await request.json()) as Record<string, string>;
    return HttpResponse.json(
      {
        success: true,
        project: {
          id: 'new-proj-id',
          name: body.name,
          description: body.description || '',
          status: 'draft',
          type: body.type || 'custom',
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  }),

  http.post('/api/chat', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }
    await request.json();
    return HttpResponse.json({
      success: true,
      message: 'I understand. I will create a todo app for you.',
    });
  }),

  http.get('/api/system/db-status', () => {
    return HttpResponse.json({
      status: 'ok',
      tables: { expected: 16, existing: 16, missing: [] },
    });
  }),

  http.get('/api/admin/metrics', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json({
      timestamp: new Date().toISOString(),
      users: { total: 10 },
      projects: { total: 25, active: 5 },
      files: { total: 500, totalSize: 1024000 },
      sessions: { total: 50 },
      tasks: { total: 200, completed: 180, completionRate: 90 },
    });
  }),
];

export const mockServer = setupServer(...handlers);

export function setupMSWServer() {
  mockServer.listen({ onUnhandledRequest: 'warn' });
  return mockServer;
}

export function teardownMSWServer() {
  mockServer.close();
}

export function resetMSWHandlers() {
  mockServer.resetHandlers();
}

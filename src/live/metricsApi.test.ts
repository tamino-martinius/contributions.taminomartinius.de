import { describe, expect, it } from 'vitest';
import { MetricsApiClient, MetricsApiError } from '@/live/metricsApi';

const recordingFetch = (status = 200, body: unknown = {}): { calls: string[]; fetch: typeof fetch } => {
  const calls: string[] = [];
  const fetchFn = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
  return { calls, fetch: fetchFn };
};

describe('MetricsApiClient', () => {
  it('builds endpoint URLs against the default base', async () => {
    const { calls, fetch } = recordingFetch();
    const client = new MetricsApiClient({ fetch });
    await client.github('octocat');
    await client.github('octocat', { years: [2016, 2017] });
    await client.github('octocat', { years: 'last', lifetime: true });
    await client.npmStats('octocat');
    await client.npmStats('octocat', { months: 6 });
    expect(calls).toEqual([
      'https://metrics-api.tamino.dev/github/octocat',
      'https://metrics-api.tamino.dev/github/octocat?y=2016%2C2017',
      'https://metrics-api.tamino.dev/github/octocat?y=last&lifetime=1',
      'https://metrics-api.tamino.dev/npm/octocat',
      'https://metrics-api.tamino.dev/npm/octocat?months=6',
    ]);
  });

  it('sends a Bearer token when provided', async () => {
    let sentAuth: string | null = null;
    const fetchFn = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      sentAuth = new Headers(init?.headers).get('authorization');
      return new Response('{}', { status: 200 });
    }) as typeof fetch;
    await new MetricsApiClient({ fetch: fetchFn }).github('octocat', { token: 'secret' });
    expect(sentAuth).toBe('Bearer secret');
  });

  it('maps 404 to MetricsApiError kind not-found', async () => {
    const { fetch } = recordingFetch(404, { error: 'user not found: x' });
    const error = await new MetricsApiClient({ fetch }).github('x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(MetricsApiError);
    expect((error as MetricsApiError).kind).toBe('not-found');
  });
});

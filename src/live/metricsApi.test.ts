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
    await client.githubContributions('octocat');
    await client.githubProfile('octocat');
    await client.githubRepos('octocat');
    await client.npmStats('octocat');
    expect(calls).toEqual([
      'https://metrics-api.tamino.dev/github/octocat/contributions',
      'https://metrics-api.tamino.dev/github/octocat/profile',
      'https://metrics-api.tamino.dev/github/octocat/repos',
      'https://metrics-api.tamino.dev/npm/octocat',
    ]);
  });

  it('maps 404 to MetricsApiError kind not-found', async () => {
    const { fetch } = recordingFetch(404, { error: 'user not found: x' });
    const error = await new MetricsApiClient({ fetch }).githubProfile('x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(MetricsApiError);
    expect((error as MetricsApiError).kind).toBe('not-found');
  });
});

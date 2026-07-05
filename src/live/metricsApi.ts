// Vendored from node-metrics-api packages/metrics-api-client — replace with the npm package once it is public.

import type { AccountStats as NpmAccountStats } from '@/types/NpmStats';

export const DEFAULT_BASE_URL = 'https://metrics-api.tamino.dev';

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface GithubContributions {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

export interface GithubOrganization {
  name: string;
  avatarUrl: string;
  url: string;
}

export interface GithubProfile {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  url: string;
  followerCount: number;
  followingCount: number;
  organizations: GithubOrganization[];
}

export interface GithubRepo {
  name: string;
  url: string;
  description: string;
  language: string | null;
  stargazerCount: number;
  forkCount: number;
  isFork: boolean;
}

export type MetricsApiErrorKind = 'bad-request' | 'not-found' | 'upstream' | 'network';

export class MetricsApiError extends Error {
  constructor(
    readonly kind: MetricsApiErrorKind,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'MetricsApiError';
  }
}

export interface MetricsApiClientOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export class MetricsApiClient {
  readonly #baseUrl: string;
  readonly #fetch: typeof fetch;

  constructor(options: MetricsApiClientOptions = {}) {
    const envBase = import.meta.env?.VITE_METRICS_API_URL as string | undefined;
    this.#baseUrl = (options.baseUrl ?? envBase ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.#fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async #get<T>(path: string): Promise<T> {
    const url = `${this.#baseUrl}${path}`;
    let response: Response;
    try {
      response = await this.#fetch(url);
    } catch (error) {
      throw new MetricsApiError('network', 0, `request failed: ${String(error)}`);
    }
    if (!response.ok) {
      const kind: MetricsApiErrorKind =
        response.status === 404 ? 'not-found' : response.status === 400 ? 'bad-request' : 'upstream';
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new MetricsApiError(kind, response.status, body.error ?? `request failed with ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  githubContributions(user: string): Promise<GithubContributions> {
    return this.#get(`/github/${encodeURIComponent(user)}/contributions`);
  }

  githubProfile(user: string): Promise<GithubProfile> {
    return this.#get(`/github/${encodeURIComponent(user)}/profile`);
  }

  githubRepos(user: string): Promise<GithubRepo[]> {
    return this.#get(`/github/${encodeURIComponent(user)}/repos`);
  }

  npmStats(user: string): Promise<NpmAccountStats> {
    return this.#get(`/npm/${encodeURIComponent(user)}`);
  }
}

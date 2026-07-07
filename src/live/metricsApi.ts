// Vendored from node-metrics-api packages/metrics-api-client (tracks v0.0.3) — replace with the npm package once it is public.

import type { AccountStats as NpmAccountStats } from '@/types/NpmStats';

export const DEFAULT_BASE_URL = 'https://metrics-api.tamino.dev';

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface GithubByType {
  commits: number;
  pullRequests: number;
  reviews: number;
  issues: number;
}

export interface GithubContributions {
  total: Record<string, number>;
  contributions: ContributionDay[];
  byType?: GithubByType;
  privateLastYear?: number;
  lifetimeTotal?: number;
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
  accountCreatedAt?: string;
  location?: string | null;
}

export interface GithubRepo {
  name: string;
  url: string;
  description: string;
  language: string | null;
  stargazerCount: number;
  forkCount: number;
  isFork: boolean;
  defaultBranchCommits?: number | null;
  createdAt?: string;
  pushedAt?: string;
}

/** Combined GitHub payload returned by `GET /github/:user` (metrics-api-server >= 0.0.3). */
export interface GithubUser {
  profile: GithubProfile;
  repos: GithubRepo[];
  contributions: GithubContributions;
  warnings?: string[];
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

  async #get<T>(path: string, params: Record<string, string> = {}, token?: string): Promise<T> {
    const query = new URLSearchParams(params).toString();
    const url = `${this.#baseUrl}${path}${query ? `?${query}` : ''}`;
    const init = token ? { headers: { authorization: `Bearer ${token}` } } : undefined;
    let response: Response;
    try {
      response = await this.#fetch(url, init);
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

  github(
    user: string,
    options: { years?: 'all' | 'last' | number[]; token?: string; lifetime?: boolean } = {},
  ): Promise<GithubUser> {
    const params: Record<string, string> = {};
    if (options.years && options.years !== 'all') {
      params.y = Array.isArray(options.years) ? options.years.join(',') : options.years;
    }
    if (options.lifetime) params.lifetime = '1';
    return this.#get(`/github/${encodeURIComponent(user)}`, params, options.token);
  }

  npmStats(user: string, options: { months?: number } = {}): Promise<NpmAccountStats> {
    const params: Record<string, string> = {};
    if (options.months !== undefined) params.months = String(options.months);
    return this.#get(`/npm/${encodeURIComponent(user)}`, params);
  }
}

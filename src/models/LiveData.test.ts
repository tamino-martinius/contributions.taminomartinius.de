import { describe, expect, it } from 'vitest';
import type { GithubContributions, GithubProfile, GithubRepo } from '@/live/metricsApi';
import { LiveData } from '@/models/LiveData';
import type { AccountStats as NpmAccountStats } from '@/types/NpmStats';

const CONTRIBUTIONS: GithubContributions = {
  total: { '2023': 3, '2024': 6 },
  contributions: [
    { date: '2023-05-10', count: 3, level: 2 }, // Wednesday
    { date: '2024-01-02', count: 2, level: 1 }, // Tuesday
    { date: '2024-01-03', count: 0, level: 0 },
    { date: '2024-12-31', count: 4, level: 3 }, // Tuesday
  ],
};

const PROFILE: GithubProfile = {
  name: 'Octo Cat',
  username: 'octocat',
  bio: 'hi',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  url: 'https://github.com/octocat',
  followerCount: 12,
  followingCount: 3,
  organizations: [],
};

const REPOS: GithubRepo[] = [
  { name: 'a', url: 'u/a', description: 'd', language: 'TypeScript', stargazerCount: 5, forkCount: 1, isFork: false },
  { name: 'b', url: 'u/b', description: '', language: 'TypeScript', stargazerCount: 2, forkCount: 0, isFork: false },
  { name: 'c', url: 'u/c', description: '', language: 'Ruby', stargazerCount: 0, forkCount: 0, isFork: true },
  { name: 'd', url: 'u/d', description: '', language: null, stargazerCount: 0, forkCount: 0, isFork: false },
];

const NPM: NpmAccountStats = {
  user: { username: 'octocat', versionsPerDate: { '2024-01-02': 1 }, versionsPerHour: { 'Tue, 08': 1 } },
  packages: [
    {
      details: { name: 'alpha', description: '', latestVersion: '1.0.0', license: 'MIT', keywords: [], links: {} },
      downloadsPerDate: { '2024-01-10': 10 },
      versionsPerDate: { '2024-01-02': 1 },
      versionsPerHour: { 'Tue, 08': 1 },
    },
  ],
};

const client = (npm: NpmAccountStats | null) => ({
  githubContributions: async () => CONTRIBUTIONS,
  githubProfile: async () => PROFILE,
  githubRepos: async () => REPOS,
  npmStats: async () => {
    if (!npm) throw new Error('no npm');
    return npm;
  },
});

describe('LiveData', () => {
  it('aggregates contributions into the MetricsData getters', async () => {
    const data = new LiveData('octocat', client(NPM), 0);
    await data.fetchData();

    expect(data.githubUser?.name).toBe('Octo Cat');
    expect(data.githubUser?.followerCount).toBe(12);

    expect(data.githubCommitStatTotals.commitCount).toBe(9);
    expect(data.githubCommitsPerDate['2023-05-10']?.commitCount).toBe(3);
    expect(data.githubCommitsPerDate['2024-01-03']).toBeUndefined(); // zero days skipped
    expect(data.githubCommitsPerYear[2024]?.commitCount).toBe(6);
    expect(data.githubCommitsPerMonthAndYear['2024-01']?.commitCount).toBe(2);
    expect(data.githubCommitsPerMonth['01']?.commitCount).toBe(2);
    expect(data.githubCommitStatsPerWeekday.Wed?.commitCount).toBe(3);
    expect(data.githubCommitStatsPerWeekday.Tue?.commitCount).toBe(6);
    expect(data.githubYears).toEqual(
      Array.from({ length: new Date().getFullYear() - 2023 + 1 }).map((_x, i) => 2023 + i),
    );
    expect(data.githubCommitsPerYearAndRepository[2024]?.Contributions?.commitCount).toBe(6);

    // repos -> public repositories + languages weighted by repo count
    expect(Object.keys(data.githubPublicRepositories)).toEqual(['a', 'b', 'c', 'd']);
    expect(data.githubCommitsPerLanguage).toEqual({ TypeScript: 2, Ruby: 1 });
    expect(data.githubCommitStatTotals.publicCommitCount).toBe(3); // language denominator

    expect(data.latestDataDate?.getFullYear()).toBe(2024);
  });

  it('exposes npm aggregates when packages exist', async () => {
    const data = new LiveData('octocat', client(NPM), 0);
    await data.fetchData();
    expect(data.hasNpmData).toBe(true);
    expect(data.npmUsername).toBe('octocat');
    expect(data.npmTotalDownloads).toBe(10);
    expect(data.npmPackageCount).toBe(1);
  });

  it('tolerates npm failure', async () => {
    const data = new LiveData('octocat', client(null), 0);
    await data.fetchData();
    expect(data.hasNpmData).toBe(false);
    expect(data.npmPackageCount).toBe(0);
  });
});

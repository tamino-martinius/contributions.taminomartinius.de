import { describe, expect, it } from 'vitest';
import { aggregateNpmStats, emptyNpmAggregates } from '@/models/npmAggregates';
import type { AccountStats } from '@/types/NpmStats';

const STATS: AccountStats = {
  user: {
    username: 'octocat',
    versionsPerDate: { '2024-01-02': 1, '2023-05-10': 2 },
    versionsPerHour: { 'Tue, 08': 1, 'Wed, 12': 1, 'Wed, 18': 1 },
  },
  packages: [
    {
      details: {
        name: 'alpha',
        description: 'a',
        latestVersion: '2.0.0',
        license: 'MIT',
        keywords: [],
        links: {},
      },
      downloadsPerDate: { '2024-01-10': 10, '2024-02-11': 5 },
      versionsPerDate: { '2023-05-10': 2, '2024-01-02': 1 },
      versionsPerHour: { 'Wed, 12': 1, 'Wed, 18': 1, 'Tue, 08': 1 },
    },
    {
      details: {
        name: '@org/beta',
        description: 'b',
        latestVersion: '0.1.0',
        license: 'MIT',
        keywords: [],
        links: {},
      },
      downloadsPerDate: { '2024-01-10': 3 },
      versionsPerDate: { '2024-06-01': 1 },
      versionsPerHour: { 'Sat, 00': 1 },
    },
  ],
};

describe('aggregateNpmStats', () => {
  const agg = aggregateNpmStats(STATS);

  it('totals downloads and versions', () => {
    expect(agg.totalDownloads).toBe(18);
    expect(agg.totalVersions).toBe(4);
  });

  it('aggregates downloads per date/year', () => {
    expect(agg.downloadsPerDate).toEqual({ '2024-01-10': 13, '2024-02-11': 5 });
    expect(agg.downloadsPerYear[2024]).toBe(18);
  });

  it('groups organizations (scope prefix, else username)', () => {
    expect(agg.organizationStats.octocat).toEqual({ downloads: 15, versions: 3, packages: 1 });
    expect(agg.organizationStats['@org']).toEqual({ downloads: 3, versions: 1, packages: 1 });
    expect(agg.organizationPackages).toEqual({ octocat: ['alpha'], '@org': ['@org/beta'] });
  });

  it('keeps per-package stats and details', () => {
    expect(agg.packageStats.alpha).toEqual({ downloads: 15, versions: 3 });
    expect(agg.packageDetails['@org/beta'].name).toBe('@org/beta');
  });

  it('derives years from downloads and versions', () => {
    expect(agg.years[0]).toBe(2023);
    expect(agg.years[agg.years.length - 1]).toBe(new Date().getFullYear());
  });

  it('emptyNpmAggregates matches the aggregate shape with empty values', () => {
    const empty = emptyNpmAggregates();
    expect(Object.keys(empty).sort()).toEqual(Object.keys(agg).sort());
    expect(empty.totalDownloads).toBe(0);
    expect(empty.years).toEqual([]);
  });
});

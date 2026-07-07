import { WEEKDAYS } from '@/constants';
import type { GithubContributions, GithubProfile, GithubRepo } from '@/live/metricsApi';
import { MetricsApiClient } from '@/live/metricsApi';
import { EMPTY_COMMIT_STATS, MIN_WAIT_DURATION } from '@/models/Data';
import type { MetricsData } from '@/models/MetricsData';
import { aggregateNpmStats, emptyNpmAggregates, type NpmAggregates } from '@/models/npmAggregates';
import type { MonthYearKey, PrivatePublicCommitStats } from '@/types/ComponentStats';
import type { DateKey, Month, PublicRepositoryDetails, UserStats, Weekday, Year } from '@/types/GitHubStats';
import type { AccountStats as NpmAccountStats } from '@/types/NpmStats';
import { splitDateKey } from '@/util/recordKey';
import { waitRemainder } from '@/util/timing';

export type LiveApi = Pick<MetricsApiClient, 'github' | 'npmStats'>;

/** Live-mode implementation of MetricsData backed by a hosted metrics-api-server.
 *  Semantics: counts are GitHub *contributions* (not commits); everything is public;
 *  additions/deletions/changedFiles stay 0. */
export class LiveData implements MetricsData {
  #username: string;
  #client: LiveApi;
  #minWait: number;

  #githubUser: UserStats | null = null;
  #commitsPerLanguage: Record<string, number> = {};
  #statTotals: PrivatePublicCommitStats = { ...EMPTY_COMMIT_STATS };
  #statsPerWeekday: Partial<Record<Weekday, PrivatePublicCommitStats>> = {};
  #commitsPerDate: Partial<Record<DateKey, PrivatePublicCommitStats>> = {};
  #commitsPerYear: Partial<Record<Year, PrivatePublicCommitStats>> = {};
  #commitsPerMonthAndYear: Partial<Record<MonthYearKey, PrivatePublicCommitStats>> = {};
  #commitsPerMonth: Partial<Record<Month, PrivatePublicCommitStats>> = {};
  #commitsPerYearAndRepository: Partial<Record<Year, Record<string, PrivatePublicCommitStats>>> = {};
  #publicRepositories: Record<string, PublicRepositoryDetails> = {};
  #years: Year[] = [];
  #latestDataDate: Date | null = null;

  #npm: NpmAggregates = emptyNpmAggregates();
  #npmAccountStats: NpmAccountStats | null = null;

  constructor(username: string, client: LiveApi = new MetricsApiClient(), minWait = MIN_WAIT_DURATION) {
    this.#username = username;
    this.#client = client;
    this.#minWait = minWait;
  }

  async fetchData(): Promise<void> {
    const startTime = Date.now();
    const [github, npmStats] = await Promise.all([
      this.#client.github(this.#username),
      this.#client.npmStats(this.#username.toLowerCase()).catch(() => null),
    ]);
    this.#applyGithub(github.contributions, github.profile, github.repos);
    if (npmStats && npmStats.packages.length > 0) {
      this.#npmAccountStats = npmStats;
      this.#npm = aggregateNpmStats(npmStats);
    }
    await waitRemainder(startTime, this.#minWait);
  }

  #add<K extends string | number>(target: Partial<Record<K, PrivatePublicCommitStats>>, key: K, count: number): void {
    const stats = target[key] ?? { ...EMPTY_COMMIT_STATS };
    stats.commitCount += count;
    stats.publicCommitCount += count;
    target[key] = stats;
  }

  #applyGithub(contributions: GithubContributions, profile: GithubProfile, repos: GithubRepo[]): void {
    this.#githubUser = {
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      url: profile.url,
      gistCount: 0,
      followerCount: profile.followerCount,
      followingCount: profile.followingCount,
      commentsPerDate: {},
      commentsPerHour: {},
    };

    for (const repo of repos) {
      this.#publicRepositories[repo.name] = {
        name: repo.name,
        url: repo.url,
        languages: repo.language ? [repo.language] : [],
        description: repo.description,
        stargazerCount: repo.stargazerCount,
        forkCount: repo.forkCount,
      };
      if (repo.language) {
        this.#commitsPerLanguage[repo.language] = (this.#commitsPerLanguage[repo.language] ?? 0) + 1;
      }
    }

    let totalContributions = 0;
    for (const day of contributions.contributions) {
      if (day.count === 0) continue;
      totalContributions += day.count;
      const dateKey = day.date as DateKey;
      const [year, month] = splitDateKey(dateKey);
      const monthYearKey: MonthYearKey = `${year}-${month}`;
      const weekday = WEEKDAYS[new Date(`${day.date}T00:00:00`).getDay()];

      this.#add(this.#commitsPerDate, dateKey, day.count);
      this.#add(this.#commitsPerYear, year, day.count);
      this.#add(this.#commitsPerMonthAndYear, monthYearKey, day.count);
      this.#add(this.#commitsPerMonth, month, day.count);
      this.#add(this.#statsPerWeekday, weekday, day.count);

      this.#commitsPerYearAndRepository[year] ??= {};
      this.#add(this.#commitsPerYearAndRepository[year], 'Contributions', day.count);
    }

    // publicCommitCount doubles as the denominator for the UserCard language shares
    // (languages are weighted by repo count in live mode — there is no commit data).
    this.#statTotals = {
      ...EMPTY_COMMIT_STATS,
      commitCount: totalContributions,
      publicCommitCount: Object.values(this.#commitsPerLanguage).reduce((sum, count) => sum + count, 0),
    };

    const years = Object.keys(contributions.total)
      .map(Number)
      .filter(Number.isInteger)
      .sort((a, b) => a - b);
    if (years.length > 0) {
      const minYear = years[0];
      this.#years = Array.from({ length: new Date().getFullYear() - minYear + 1 }).map((_x, i) => minYear + i);
    }

    const activeDates = contributions.contributions.filter((day) => day.count > 0);
    const lastActive = activeDates[activeDates.length - 1];
    this.#latestDataDate = lastActive ? new Date(`${lastActive.date}T00:00:00`) : null;
  }

  // GitHub getters
  get githubUser() {
    return this.#githubUser;
  }
  get githubCommitsPerLanguage() {
    return this.#commitsPerLanguage;
  }
  get githubCommitStatTotals() {
    return this.#statTotals;
  }
  get githubCommitStatsPerHour() {
    return {};
  }
  get githubCommitStatsPerWeekday() {
    return this.#statsPerWeekday;
  }
  get githubCommitsPerRepository() {
    return {};
  }
  get githubCommitsPerDate() {
    return this.#commitsPerDate;
  }
  get githubCommitsPerYear() {
    return this.#commitsPerYear;
  }
  get githubCommitsPerYearAndRepository() {
    return this.#commitsPerYearAndRepository;
  }
  get githubCommitsPerMonth() {
    return this.#commitsPerMonth;
  }
  get githubLanguagesPerYear() {
    return {};
  }
  get githubCommitsPerMonthAndYear() {
    return this.#commitsPerMonthAndYear;
  }
  get githubYears() {
    return this.#years;
  }
  get githubPublicRepositories() {
    return this.#publicRepositories;
  }

  // npm getters (delegating to the shared aggregates)
  get hasNpmData() {
    return (this.#npmAccountStats?.packages.length ?? 0) > 0;
  }
  get npmUsername() {
    return this.#npmAccountStats?.user.username ?? '';
  }
  get npmTotalDownloads() {
    return this.#npm.totalDownloads;
  }
  get npmTotalVersions() {
    return this.#npm.totalVersions;
  }
  get npmPackageCount() {
    return this.#npmAccountStats?.packages.length ?? 0;
  }
  get npmOrganizationCount() {
    return Object.keys(this.#npm.organizationStats).length;
  }
  get npmDownloadsPerDate() {
    return this.#npm.downloadsPerDate;
  }
  get npmDownloadsPerYear() {
    return this.#npm.downloadsPerYear;
  }
  get npmDownloadsPerMonthAndYear() {
    return this.#npm.downloadsPerMonthAndYear;
  }
  get npmVersionsPerDate() {
    return this.#npm.versionsPerDate;
  }
  get npmVersionsPerHour() {
    return this.#npm.versionsPerHour;
  }
  get npmVersionsPerWeekday() {
    return this.#npm.versionsPerWeekday;
  }
  get npmPackageStats() {
    return this.#npm.packageStats;
  }
  get npmPackageStatsPerYear() {
    return this.#npm.packageStatsPerYear;
  }
  get npmPackageStatsPerMonthAndYear() {
    return this.#npm.packageStatsPerMonthAndYear;
  }
  get npmPackageDownloadsPerWeek() {
    return this.#npm.packageDownloadsPerWeek;
  }
  get npmWeekKeys() {
    return this.#npm.weekKeys;
  }
  get npmOrganizationPackages() {
    return this.#npm.organizationPackages;
  }
  get npmPackageWeeklyDownloads() {
    return this.#npm.packageWeeklyDownloads;
  }
  get npmOrganizationStats() {
    return this.#npm.organizationStats;
  }
  get npmOrganizationStatsPerYear() {
    return this.#npm.organizationStatsPerYear;
  }
  get npmOrganizationStatsPerMonthAndYear() {
    return this.#npm.organizationStatsPerMonthAndYear;
  }
  get npmPackageDetails() {
    return this.#npm.packageDetails;
  }
  get npmYears() {
    return this.#npm.years;
  }
  get npmPackages() {
    return this.#npmAccountStats?.packages ?? [];
  }

  get latestDataDate() {
    return this.#latestDataDate;
  }
}

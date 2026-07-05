import type { MetricsData } from '@/models/MetricsData';
import { aggregateNpmStats, emptyNpmAggregates, type NpmAggregates } from '@/models/npmAggregates';
import type { MonthYearKey, PrivatePublicCommitStats } from '@/types/ComponentStats';
import type {
  AccountStats,
  DateKey,
  HourKey,
  Month,
  PublicRepositoryDetails,
  UserStats,
  Weekday,
  Year,
} from '@/types/GitHubStats';
import type { AccountStats as NpmAccountStats, PackageStats } from '@/types/NpmStats';
import { splitDateKey, splitHourKey } from '@/util/recordKey';

const GITHUB_ACCOUNTS = ['tamino-martinius', 'tamino-cookieai'];
const NPM_ACCOUNT = 'tamino-martinius';
const MIN_WAIT_DURATION = 1_650;

const accountUrls = GITHUB_ACCOUNTS.map(
  (account) => `https://raw.githubusercontent.com/${account}/github-stats/${account}/data/stats.json`,
);

const npmUrl = `https://raw.githubusercontent.com/${NPM_ACCOUNT}/npm-stats/refs/heads/${NPM_ACCOUNT}/data/stats.json`;

export const EMPTY_COMMIT_STATS: Readonly<PrivatePublicCommitStats> = Object.freeze({
  commitCount: 0,
  publicCommitCount: 0,
  privateCommitCount: 0,
  additions: 0,
  deletions: 0,
  changedFiles: 0,
  publicChangedFiles: 0,
  privateChangedFiles: 0,
});

export class Data implements MetricsData {
  // GitHub data
  #githubAccountStats: AccountStats | null = null;
  #githubCommitsPerLanguage: Record<string, number> = {};
  #githubCommitStatTotals: PrivatePublicCommitStats = { ...EMPTY_COMMIT_STATS };
  #githubCommitStatsPerHour: Partial<Record<HourKey, PrivatePublicCommitStats>> = {};
  #githubCommitStatsPerWeekday: Partial<Record<Weekday, PrivatePublicCommitStats>> = {};
  #githubCommitsPerRepository: Record<string, PrivatePublicCommitStats> = {};
  #githubPublicRepositories: Record<string, PublicRepositoryDetails> = {};
  #githubCommitsPerYearAndRepository: Partial<Record<Year, Record<string, PrivatePublicCommitStats>>> = {};
  #githubCommitsPerDate: Partial<Record<DateKey, PrivatePublicCommitStats>> = {};
  #githubCommitsPerMonthAndYear: Partial<Record<MonthYearKey, PrivatePublicCommitStats>> = {};
  #githubCommitsPerYear: Partial<Record<Year, PrivatePublicCommitStats>> = {};
  #githubCommitsPerMonth: Partial<Record<Month, PrivatePublicCommitStats>> = {};
  #githubLanguagesPerYear: Partial<Record<Year, Record<string, number>>> = {};
  #githubYears: Year[] = [];

  // NPM data
  #npmAccountStats: NpmAccountStats | null = null;
  #npm: NpmAggregates = emptyNpmAggregates();

  async #fetchGithubStats() {
    const responses = await Promise.all(accountUrls.map((url) => fetch(url)));
    const accounts: AccountStats[] = await Promise.all(responses.map((r) => r.json()));
    return accounts.reduce<AccountStats>(
      (acc, account) => {
        Object.assign(acc.organizations, account.organizations);
        Object.assign(acc.languageColors, account.languageColors);
        acc.repositories.push(...account.repositories);
        return acc;
      },
      {
        user: accounts[0].user,
        organizations: {},
        languageColors: {},
        repositories: [],
      },
    );
  }

  async #fetchNpmStats(): Promise<NpmAccountStats> {
    const response = await fetch(npmUrl);
    return response.json();
  }

  #calculateGithubAccountStats() {
    if (!this.#githubAccountStats) return;
    let privateIndex = 0;
    for (const repo of this.#githubAccountStats.repositories) {
      const { public: repoDetails, commitsPerHour, commitsPerDate } = repo;
      const isPublic = typeof repoDetails !== 'undefined';
      const repoName = isPublic ? repoDetails.name : `Private#${++privateIndex}`;
      const repoCommitStats = { ...EMPTY_COMMIT_STATS };
      if (isPublic) {
        this.#githubPublicRepositories[repoName] = repoDetails;
      }
      for (const [key, commitStats] of Object.entries(commitsPerHour)) {
        if (!commitStats) continue;
        const hourKey = key as HourKey;
        const [weekday, _hour] = splitHourKey(hourKey);
        // Repo Stats
        repoCommitStats.commitCount += commitStats.commitCount;
        repoCommitStats.additions += commitStats.additions;
        repoCommitStats.deletions += commitStats.deletions;
        repoCommitStats.changedFiles += commitStats.changedFiles;
        // Hour Stats
        if (!this.#githubCommitStatsPerHour[hourKey]) {
          this.#githubCommitStatsPerHour[hourKey] = { ...EMPTY_COMMIT_STATS };
        }
        this.#githubCommitStatsPerHour[hourKey].commitCount += commitStats.commitCount;
        this.#githubCommitStatsPerHour[hourKey].additions += commitStats.additions;
        this.#githubCommitStatsPerHour[hourKey].deletions += commitStats.deletions;
        this.#githubCommitStatsPerHour[hourKey].changedFiles += commitStats.changedFiles;
        // Weekday Stats
        if (!this.#githubCommitStatsPerWeekday[weekday]) {
          this.#githubCommitStatsPerWeekday[weekday] = { ...EMPTY_COMMIT_STATS };
        }
        this.#githubCommitStatsPerWeekday[weekday].commitCount += commitStats.commitCount;
        this.#githubCommitStatsPerWeekday[weekday].additions += commitStats.additions;
        this.#githubCommitStatsPerWeekday[weekday].deletions += commitStats.deletions;
        this.#githubCommitStatsPerWeekday[weekday].changedFiles += commitStats.changedFiles;
        // Private/Public Stats
        if (isPublic) {
          repoCommitStats.publicCommitCount += commitStats.commitCount;
          this.#githubCommitStatsPerHour[hourKey].publicCommitCount += commitStats.commitCount;
          this.#githubCommitStatsPerWeekday[weekday].publicCommitCount += commitStats.commitCount;
          repoCommitStats.publicChangedFiles += commitStats.changedFiles;
          this.#githubCommitStatsPerHour[hourKey].publicChangedFiles += commitStats.changedFiles;
          this.#githubCommitStatsPerWeekday[weekday].publicChangedFiles += commitStats.changedFiles;
        } else {
          repoCommitStats.privateCommitCount += commitStats.commitCount;
          this.#githubCommitStatsPerHour[hourKey].privateCommitCount += commitStats.commitCount;
          this.#githubCommitStatsPerWeekday[weekday].privateCommitCount += commitStats.commitCount;
          repoCommitStats.privateChangedFiles += commitStats.changedFiles;
          this.#githubCommitStatsPerHour[hourKey].privateChangedFiles += commitStats.changedFiles;
          this.#githubCommitStatsPerWeekday[weekday].privateChangedFiles += commitStats.changedFiles;
        }
      }
      // Date Stats
      for (const [key, commitStats] of Object.entries(commitsPerDate)) {
        if (!commitStats) continue;
        const dateKey = key as DateKey;
        const [year, month, _day] = splitDateKey(dateKey);
        const monthYearKey = `${year}-${month}` satisfies MonthYearKey;

        // Date Stats
        if (!this.#githubCommitsPerDate[dateKey]) {
          this.#githubCommitsPerDate[dateKey] = { ...EMPTY_COMMIT_STATS };
        }
        this.#githubCommitsPerDate[dateKey].commitCount += commitStats.commitCount;
        this.#githubCommitsPerDate[dateKey].additions += commitStats.additions;
        this.#githubCommitsPerDate[dateKey].deletions += commitStats.deletions;
        this.#githubCommitsPerDate[dateKey].changedFiles += commitStats.changedFiles;
        // Year Stats
        if (!this.#githubCommitsPerYear[year]) {
          this.#githubCommitsPerYear[year] = { ...EMPTY_COMMIT_STATS };
        }
        this.#githubCommitsPerYear[year].commitCount += commitStats.commitCount;
        this.#githubCommitsPerYear[year].additions += commitStats.additions;
        this.#githubCommitsPerYear[year].deletions += commitStats.deletions;
        this.#githubCommitsPerYear[year].changedFiles += commitStats.changedFiles;
        // Month Stats
        if (!this.#githubCommitsPerMonth[month]) {
          this.#githubCommitsPerMonth[month] = { ...EMPTY_COMMIT_STATS };
        }
        this.#githubCommitsPerMonth[month].commitCount += commitStats.commitCount;
        this.#githubCommitsPerMonth[month].additions += commitStats.additions;
        this.#githubCommitsPerMonth[month].deletions += commitStats.deletions;
        this.#githubCommitsPerMonth[month].changedFiles += commitStats.changedFiles;
        // Month Year Stats
        if (!this.#githubCommitsPerMonthAndYear[monthYearKey]) {
          this.#githubCommitsPerMonthAndYear[monthYearKey] = { ...EMPTY_COMMIT_STATS };
        }
        this.#githubCommitsPerMonthAndYear[monthYearKey].commitCount += commitStats.commitCount;
        this.#githubCommitsPerMonthAndYear[monthYearKey].additions += commitStats.additions;
        this.#githubCommitsPerMonthAndYear[monthYearKey].deletions += commitStats.deletions;
        this.#githubCommitsPerMonthAndYear[monthYearKey].changedFiles += commitStats.changedFiles;
        // Year and Repository Stats
        if (!this.#githubCommitsPerYearAndRepository[year]) {
          this.#githubCommitsPerYearAndRepository[year] = {};
        }
        if (!this.#githubCommitsPerYearAndRepository[year][repoName]) {
          this.#githubCommitsPerYearAndRepository[year][repoName] = { ...EMPTY_COMMIT_STATS };
        }
        this.#githubCommitsPerYearAndRepository[year][repoName].commitCount += commitStats.commitCount;
        this.#githubCommitsPerYearAndRepository[year][repoName].additions += commitStats.additions;
        this.#githubCommitsPerYearAndRepository[year][repoName].deletions += commitStats.deletions;
        this.#githubCommitsPerYearAndRepository[year][repoName].changedFiles += commitStats.changedFiles;
        // Public/Private Stats
        if (isPublic) {
          this.#githubCommitsPerDate[dateKey].publicCommitCount += commitStats.commitCount;
          this.#githubCommitsPerYear[year].publicCommitCount += commitStats.commitCount;
          this.#githubCommitsPerMonth[month].publicCommitCount += commitStats.commitCount;
          this.#githubCommitsPerMonthAndYear[monthYearKey].publicCommitCount += commitStats.commitCount;
          this.#githubCommitsPerYearAndRepository[year][repoName].publicCommitCount += commitStats.commitCount;
          this.#githubCommitsPerDate[dateKey].publicChangedFiles += commitStats.changedFiles;
          this.#githubCommitsPerYear[year].publicChangedFiles += commitStats.changedFiles;
          this.#githubCommitsPerMonth[month].publicChangedFiles += commitStats.changedFiles;
          this.#githubCommitsPerMonthAndYear[monthYearKey].publicChangedFiles += commitStats.changedFiles;
          this.#githubCommitsPerYearAndRepository[year][repoName].publicChangedFiles += commitStats.changedFiles;
          // Language Stats
          for (const language of repoDetails.languages) {
            this.#githubCommitsPerLanguage[language] =
              (this.#githubCommitsPerLanguage[language] ?? 0) + commitStats.commitCount;
            if (!this.#githubLanguagesPerYear[year]) {
              this.#githubLanguagesPerYear[year] = {};
            }
            this.#githubLanguagesPerYear[year][language] =
              (this.#githubLanguagesPerYear[year][language] ?? 0) + commitStats.commitCount;
          }
        } else {
          this.#githubCommitsPerDate[dateKey].privateCommitCount += commitStats.commitCount;
          this.#githubCommitsPerYear[year].privateCommitCount += commitStats.commitCount;
          this.#githubCommitsPerMonth[month].privateCommitCount += commitStats.commitCount;
          this.#githubCommitsPerMonthAndYear[monthYearKey].privateCommitCount += commitStats.commitCount;
          this.#githubCommitsPerYearAndRepository[year][repoName].privateCommitCount += commitStats.commitCount;
          this.#githubCommitsPerDate[dateKey].privateChangedFiles += commitStats.changedFiles;
          this.#githubCommitsPerYear[year].privateChangedFiles += commitStats.changedFiles;
          this.#githubCommitsPerMonth[month].privateChangedFiles += commitStats.changedFiles;
          this.#githubCommitsPerMonthAndYear[monthYearKey].privateChangedFiles += commitStats.changedFiles;
          this.#githubCommitsPerYearAndRepository[year][repoName].privateChangedFiles += commitStats.changedFiles;
        }
      }
      // Repository Stats
      this.#githubCommitsPerRepository[repoName] = repoCommitStats;
      // Commit Stat Totals
      this.#githubCommitStatTotals.commitCount += repoCommitStats.commitCount;
      this.#githubCommitStatTotals.additions += repoCommitStats.additions;
      this.#githubCommitStatTotals.deletions += repoCommitStats.deletions;
      this.#githubCommitStatTotals.changedFiles += repoCommitStats.changedFiles;
      this.#githubCommitStatTotals.publicCommitCount += repoCommitStats.publicCommitCount;
      this.#githubCommitStatTotals.privateCommitCount += repoCommitStats.privateCommitCount;
      this.#githubCommitStatTotals.publicChangedFiles += repoCommitStats.publicChangedFiles;
      this.#githubCommitStatTotals.privateChangedFiles += repoCommitStats.privateChangedFiles;
    }
    const minYear = Math.min(...Object.keys(this.#githubCommitsPerYear).map(Number));
    this.#githubYears = Array.from({ length: new Date().getFullYear() - minYear + 1 }).map((_x, i) => minYear + i);
  }

  async fetchData() {
    const startTime = Date.now();
    const [githubAccountStats, npmAccountStats] = await Promise.all([this.#fetchGithubStats(), this.#fetchNpmStats()]);
    this.#githubAccountStats = githubAccountStats;
    this.#npmAccountStats = npmAccountStats;
    this.#calculateGithubAccountStats();
    this.#npm = aggregateNpmStats(npmAccountStats);
    const duration = Date.now() - startTime;
    if (duration < MIN_WAIT_DURATION) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, MIN_WAIT_DURATION - duration);
      });
    }
  }

  get hasNpmData(): boolean {
    return true;
  }

  // GitHub getters
  get githubUser(): UserStats | null {
    return this.#githubAccountStats?.user ?? null;
  }

  get githubCommitsPerLanguage() {
    return this.#githubCommitsPerLanguage;
  }

  get githubCommitStatTotals() {
    return this.#githubCommitStatTotals;
  }

  get githubCommitStatsPerHour() {
    return this.#githubCommitStatsPerHour;
  }

  get githubCommitStatsPerWeekday() {
    return this.#githubCommitStatsPerWeekday;
  }

  get githubCommitsPerRepository() {
    return this.#githubCommitsPerRepository;
  }

  get githubCommitsPerDate() {
    return this.#githubCommitsPerDate;
  }

  get githubCommitsPerYear() {
    return this.#githubCommitsPerYear;
  }

  get githubCommitsPerYearAndRepository() {
    return this.#githubCommitsPerYearAndRepository;
  }

  get githubCommitsPerMonth() {
    return this.#githubCommitsPerMonth;
  }

  get githubLanguagesPerYear() {
    return this.#githubLanguagesPerYear;
  }

  get githubCommitsPerMonthAndYear() {
    return this.#githubCommitsPerMonthAndYear;
  }

  get githubYears() {
    return this.#githubYears;
  }

  get githubPublicRepositories() {
    return this.#githubPublicRepositories;
  }

  // NPM getters
  get npmUsername(): string {
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

  get npmPackages(): PackageStats[] {
    return this.#npmAccountStats?.packages ?? [];
  }

  // Latest date covered by the synced data. Date keys are zero-padded
  // `YYYY-MM-DD`, so lexicographic comparison is already chronological.
  // Combines both sources by taking the oldest of their latest dates, so the
  // value never overstates how fresh the least up-to-date source is.
  get latestDataDate(): Date | null {
    const maxKey = (keys: string[]): string | null =>
      keys.length === 0 ? null : keys.reduce((a, b) => (a > b ? a : b));

    const githubLatest = maxKey(Object.keys(this.#githubCommitsPerDate));
    const npmLatest = maxKey([...Object.keys(this.#npm.downloadsPerDate), ...Object.keys(this.#npm.versionsPerDate)]);

    const candidates = [githubLatest, npmLatest].filter((key): key is string => key !== null);
    if (candidates.length === 0) return null;
    const oldestLatest = candidates.reduce((a, b) => (a < b ? a : b));

    return new Date(`${oldestLatest}T00:00:00`);
  }
}

export default Data;

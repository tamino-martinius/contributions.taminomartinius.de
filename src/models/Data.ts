import type {
  MonthYearKey,
  NpmOrganizationStats,
  NpmPackageStats,
  PrivatePublicCommitStats,
} from '@/types/ComponentStats';
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
import type { AccountStats as NpmAccountStats, PackageDetails, PackageStats } from '@/types/NpmStats';
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

export class Data {
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
  #npmTotalDownloads = 0;
  #npmTotalVersions = 0;
  #npmDownloadsPerDate: Partial<Record<DateKey, number>> = {};
  #npmDownloadsPerYear: Partial<Record<Year, number>> = {};
  #npmDownloadsPerMonthAndYear: Partial<Record<MonthYearKey, number>> = {};
  #npmVersionsPerDate: Partial<Record<DateKey, number>> = {};
  #npmVersionsPerHour: Partial<Record<HourKey, number>> = {};
  #npmVersionsPerWeekday: Partial<Record<Weekday, number>> = {};
  #npmPackageStats: Record<string, NpmPackageStats> = {};
  #npmPackageStatsPerYear: Partial<Record<Year, Record<string, NpmPackageStats>>> = {};
  #npmPackageStatsPerMonthAndYear: Partial<Record<MonthYearKey, Record<string, NpmPackageStats>>> = {};
  #npmOrganizationStats: Record<string, NpmOrganizationStats> = {};
  #npmOrganizationStatsPerYear: Partial<Record<Year, Record<string, NpmOrganizationStats>>> = {};
  #npmOrganizationStatsPerMonthAndYear: Partial<Record<MonthYearKey, Record<string, NpmOrganizationStats>>> = {};
  #npmOrganizationPackages: Record<string, string[]> = {};
  #npmPackageWeeklyDownloads: Record<string, number> = {};
  #npmPackageDownloadsPerWeek: Record<string, Record<string, number>> = {}; // weekKey -> { pkgName -> downloads }
  #npmWeekKeys: DateKey[] = [];
  #npmPackageDetails: Record<string, PackageDetails> = {};
  #npmYears: Year[] = [];

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

  #calculateNpmAccountStats() {
    if (!this.#npmAccountStats) return;

    // Compute last full week (Mon-Sun) date keys
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - (dayOfWeek === 0 ? 7 : dayOfWeek));
    const lastMonday = new Date(lastSunday);
    lastMonday.setDate(lastSunday.getDate() - 6);
    const lastFullWeekDateKeys: DateKey[] = [];
    for (const d = new Date(lastMonday); d <= lastSunday; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      lastFullWeekDateKeys.push(`${y}-${m}-${day}` as DateKey);
    }

    // Aggregate user-level versions (for daytime/heatmap charts)
    for (const [key, count] of Object.entries(this.#npmAccountStats.user.versionsPerDate)) {
      if (!count) continue;
      const dateKey = key as DateKey;
      const [year] = splitDateKey(dateKey);

      this.#npmVersionsPerDate[dateKey] = (this.#npmVersionsPerDate[dateKey] ?? 0) + count;

      // Year
      this.#npmDownloadsPerYear[year] = this.#npmDownloadsPerYear[year] ?? 0;
    }

    for (const [key, count] of Object.entries(this.#npmAccountStats.user.versionsPerHour)) {
      if (!count) continue;
      const hourKey = key as HourKey;
      const [weekday] = splitHourKey(hourKey);

      this.#npmVersionsPerHour[hourKey] = (this.#npmVersionsPerHour[hourKey] ?? 0) + count;
      this.#npmVersionsPerWeekday[weekday] = (this.#npmVersionsPerWeekday[weekday] ?? 0) + count;
    }

    // Aggregate per-package data
    for (const pkg of this.#npmAccountStats.packages) {
      this.#npmPackageDetails[pkg.details.name] = pkg.details;
      const organizationName = pkg.details.name.includes('/')
        ? pkg.details.name.split('/')[0]
        : this.#npmAccountStats.user.username;
      if (!this.#npmOrganizationStats[organizationName]) {
        this.#npmOrganizationStats[organizationName] = {
          downloads: 0,
          versions: 0,
          packages: 0,
        };
      }
      this.#npmOrganizationStats[organizationName].packages += 1;
      if (!this.#npmOrganizationPackages[organizationName]) {
        this.#npmOrganizationPackages[organizationName] = [];
      }
      this.#npmOrganizationPackages[organizationName].push(pkg.details.name);

      let pkgDownloads = 0;
      for (const [key, count] of Object.entries(pkg.downloadsPerDate)) {
        if (!count) continue;
        const dateKey = key as DateKey;
        const [year, month] = splitDateKey(dateKey);
        const monthYearKey = `${year}-${month}` satisfies MonthYearKey;

        pkgDownloads += count;
        this.#npmDownloadsPerDate[dateKey] = (this.#npmDownloadsPerDate[dateKey] ?? 0) + count;
        this.#npmDownloadsPerYear[year] = (this.#npmDownloadsPerYear[year] ?? 0) + count;
        this.#npmDownloadsPerMonthAndYear[monthYearKey] =
          (this.#npmDownloadsPerMonthAndYear[monthYearKey] ?? 0) + count;

        // Per-package per-year downloads
        if (!this.#npmPackageStatsPerYear[year]) {
          this.#npmPackageStatsPerYear[year] = {};
        }
        if (!this.#npmPackageStatsPerYear[year][pkg.details.name]) {
          this.#npmPackageStatsPerYear[year][pkg.details.name] = { downloads: 0, versions: 0 };
        }
        this.#npmPackageStatsPerYear[year][pkg.details.name].downloads += count;

        // Per-package per-month-year downloads
        if (!this.#npmPackageStatsPerMonthAndYear[monthYearKey]) {
          this.#npmPackageStatsPerMonthAndYear[monthYearKey] = {};
        }
        if (!this.#npmPackageStatsPerMonthAndYear[monthYearKey][pkg.details.name]) {
          this.#npmPackageStatsPerMonthAndYear[monthYearKey][pkg.details.name] = { downloads: 0, versions: 0 };
        }
        this.#npmPackageStatsPerMonthAndYear[monthYearKey][pkg.details.name].downloads += count;

        // Per-package per-week downloads
        const date = new Date(dateKey);
        const day = date.getDay(); // 0=Sun
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const monday = new Date(date);
        monday.setDate(date.getDate() + mondayOffset);
        const weekKey =
          `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}` as DateKey;
        if (!this.#npmPackageDownloadsPerWeek[weekKey]) {
          this.#npmPackageDownloadsPerWeek[weekKey] = {};
        }
        this.#npmPackageDownloadsPerWeek[weekKey][pkg.details.name] =
          (this.#npmPackageDownloadsPerWeek[weekKey][pkg.details.name] ?? 0) + count;

        // Per-organization per-year downloads
        if (!this.#npmOrganizationStatsPerYear[year]) {
          this.#npmOrganizationStatsPerYear[year] = {};
        }
        if (!this.#npmOrganizationStatsPerYear[year][organizationName]) {
          this.#npmOrganizationStatsPerYear[year][organizationName] = { downloads: 0, versions: 0, packages: 0 };
        }
        this.#npmOrganizationStatsPerYear[year][organizationName].downloads += count;

        // Per-organization per-month-year downloads
        if (!this.#npmOrganizationStatsPerMonthAndYear[monthYearKey]) {
          this.#npmOrganizationStatsPerMonthAndYear[monthYearKey] = {};
        }
        if (!this.#npmOrganizationStatsPerMonthAndYear[monthYearKey][organizationName]) {
          this.#npmOrganizationStatsPerMonthAndYear[monthYearKey][organizationName] = {
            downloads: 0,
            versions: 0,
            packages: 0,
          };
        }
        this.#npmOrganizationStatsPerMonthAndYear[monthYearKey][organizationName].downloads += count;
      }

      // Per-package per-year versions
      for (const [key, count] of Object.entries(pkg.versionsPerDate)) {
        if (!count) continue;
        const dateKey = key as DateKey;
        const [year, month] = splitDateKey(dateKey);
        const monthYearKey = `${year}-${month}` satisfies MonthYearKey;

        if (!this.#npmPackageStatsPerYear[year]) {
          this.#npmPackageStatsPerYear[year] = {};
        }
        if (!this.#npmPackageStatsPerYear[year][pkg.details.name]) {
          this.#npmPackageStatsPerYear[year][pkg.details.name] = { downloads: 0, versions: 0 };
        }
        this.#npmPackageStatsPerYear[year][pkg.details.name].versions += count;

        // Per-package per-month-year versions
        if (!this.#npmPackageStatsPerMonthAndYear[monthYearKey]) {
          this.#npmPackageStatsPerMonthAndYear[monthYearKey] = {};
        }
        if (!this.#npmPackageStatsPerMonthAndYear[monthYearKey][pkg.details.name]) {
          this.#npmPackageStatsPerMonthAndYear[monthYearKey][pkg.details.name] = { downloads: 0, versions: 0 };
        }
        this.#npmPackageStatsPerMonthAndYear[monthYearKey][pkg.details.name].versions += count;

        if (!this.#npmOrganizationStatsPerYear[year]) {
          this.#npmOrganizationStatsPerYear[year] = {};
        }
        if (!this.#npmOrganizationStatsPerYear[year][organizationName]) {
          this.#npmOrganizationStatsPerYear[year][organizationName] = { downloads: 0, versions: 0, packages: 0 };
        }
        this.#npmOrganizationStatsPerYear[year][organizationName].versions += count;

        // Per-organization per-month-year versions
        if (!this.#npmOrganizationStatsPerMonthAndYear[monthYearKey]) {
          this.#npmOrganizationStatsPerMonthAndYear[monthYearKey] = {};
        }
        if (!this.#npmOrganizationStatsPerMonthAndYear[monthYearKey][organizationName]) {
          this.#npmOrganizationStatsPerMonthAndYear[monthYearKey][organizationName] = {
            downloads: 0,
            versions: 0,
            packages: 0,
          };
        }
        this.#npmOrganizationStatsPerMonthAndYear[monthYearKey][organizationName].versions += count;
      }

      const versionCount = Object.values(pkg.versionsPerDate).reduce<number>((acc, count) => acc + (count ?? 0), 0);

      this.#npmPackageStats[pkg.details.name] = {
        downloads: pkgDownloads,
        versions: versionCount,
      };
      this.#npmOrganizationStats[organizationName].downloads += pkgDownloads;
      this.#npmOrganizationStats[organizationName].versions += versionCount;
      this.#npmTotalDownloads += pkgDownloads;
      this.#npmTotalVersions += versionCount;

      // Weekly downloads (last full week Mon-Sun)
      let weeklyDownloads = 0;
      for (const dateKey of lastFullWeekDateKeys) {
        weeklyDownloads += (pkg.downloadsPerDate[dateKey] as number) ?? 0;
      }
      this.#npmPackageWeeklyDownloads[pkg.details.name] = weeklyDownloads;
    }

    // Count packages per org per year and per month-year
    for (const pkg of this.#npmAccountStats.packages) {
      const organizationName = pkg.details.name.includes('/')
        ? pkg.details.name.split('/')[0]
        : this.#npmAccountStats.user.username;

      // Collect active months for this package
      const activeMonths = new Set<MonthYearKey>();
      for (const key of Object.keys(pkg.downloadsPerDate)) {
        if (!pkg.downloadsPerDate[key as DateKey]) continue;
        const [year, month] = splitDateKey(key as DateKey);
        activeMonths.add(`${year}-${month}` satisfies MonthYearKey);
      }
      for (const key of Object.keys(pkg.versionsPerDate)) {
        if (!pkg.versionsPerDate[key as DateKey]) continue;
        const [year, month] = splitDateKey(key as DateKey);
        activeMonths.add(`${year}-${month}` satisfies MonthYearKey);
      }

      // Count per year
      for (const yearKey of Object.keys(this.#npmPackageStatsPerYear)) {
        const year = Number(yearKey) as Year;
        if (!this.#npmPackageStatsPerYear[year]?.[pkg.details.name]) continue;
        if (!this.#npmOrganizationStatsPerYear[year]) {
          this.#npmOrganizationStatsPerYear[year] = {};
        }
        if (!this.#npmOrganizationStatsPerYear[year][organizationName]) {
          this.#npmOrganizationStatsPerYear[year][organizationName] = { downloads: 0, versions: 0, packages: 0 };
        }
        this.#npmOrganizationStatsPerYear[year][organizationName].packages += 1;
      }

      // Count per month-year
      for (const monthYearKey of activeMonths) {
        if (!this.#npmOrganizationStatsPerMonthAndYear[monthYearKey]) {
          this.#npmOrganizationStatsPerMonthAndYear[monthYearKey] = {};
        }
        if (!this.#npmOrganizationStatsPerMonthAndYear[monthYearKey][organizationName]) {
          this.#npmOrganizationStatsPerMonthAndYear[monthYearKey][organizationName] = {
            downloads: 0,
            versions: 0,
            packages: 0,
          };
        }
        this.#npmOrganizationStatsPerMonthAndYear[monthYearKey][organizationName].packages += 1;
      }
    }

    // Calculate years
    const allYearKeys = new Set<number>();
    for (const key of Object.keys(this.#npmDownloadsPerYear)) {
      allYearKeys.add(Number(key));
    }
    for (const key of Object.keys(this.#npmVersionsPerDate)) {
      const [year] = splitDateKey(key as DateKey);
      allYearKeys.add(year);
    }
    if (allYearKeys.size > 0) {
      const minYear = Math.min(...allYearKeys);
      this.#npmYears = Array.from({ length: new Date().getFullYear() - minYear + 1 }).map((_x, i) => minYear + i);
    }

    // Sort week keys
    this.#npmWeekKeys = (Object.keys(this.#npmPackageDownloadsPerWeek) as DateKey[]).sort();
  }

  async fetchData() {
    const startTime = Date.now();
    const [githubAccountStats, npmAccountStats] = await Promise.all([this.#fetchGithubStats(), this.#fetchNpmStats()]);
    this.#githubAccountStats = githubAccountStats;
    this.#npmAccountStats = npmAccountStats;
    this.#calculateGithubAccountStats();
    this.#calculateNpmAccountStats();
    const duration = Date.now() - startTime;
    if (duration < MIN_WAIT_DURATION) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, MIN_WAIT_DURATION - duration);
      });
    }
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
    return this.#npmTotalDownloads;
  }

  get npmTotalVersions() {
    return this.#npmTotalVersions;
  }

  get npmPackageCount() {
    return this.#npmAccountStats?.packages.length ?? 0;
  }

  get npmOrganizationCount() {
    return Object.keys(this.#npmOrganizationStats).length;
  }

  get npmDownloadsPerDate() {
    return this.#npmDownloadsPerDate;
  }

  get npmDownloadsPerYear() {
    return this.#npmDownloadsPerYear;
  }

  get npmDownloadsPerMonthAndYear() {
    return this.#npmDownloadsPerMonthAndYear;
  }

  get npmVersionsPerDate() {
    return this.#npmVersionsPerDate;
  }

  get npmVersionsPerHour() {
    return this.#npmVersionsPerHour;
  }

  get npmVersionsPerWeekday() {
    return this.#npmVersionsPerWeekday;
  }

  get npmPackageStats() {
    return this.#npmPackageStats;
  }

  get npmPackageStatsPerYear() {
    return this.#npmPackageStatsPerYear;
  }

  get npmPackageStatsPerMonthAndYear() {
    return this.#npmPackageStatsPerMonthAndYear;
  }

  get npmPackageDownloadsPerWeek() {
    return this.#npmPackageDownloadsPerWeek;
  }

  get npmWeekKeys() {
    return this.#npmWeekKeys;
  }

  get npmOrganizationPackages() {
    return this.#npmOrganizationPackages;
  }

  get npmPackageWeeklyDownloads() {
    return this.#npmPackageWeeklyDownloads;
  }

  get npmOrganizationStats() {
    return this.#npmOrganizationStats;
  }

  get npmOrganizationStatsPerYear() {
    return this.#npmOrganizationStatsPerYear;
  }

  get npmOrganizationStatsPerMonthAndYear() {
    return this.#npmOrganizationStatsPerMonthAndYear;
  }

  get npmPackageDetails() {
    return this.#npmPackageDetails;
  }

  get npmYears() {
    return this.#npmYears;
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
    const npmLatest = maxKey([...Object.keys(this.#npmDownloadsPerDate), ...Object.keys(this.#npmVersionsPerDate)]);

    const candidates = [githubLatest, npmLatest].filter((key): key is string => key !== null);
    if (candidates.length === 0) return null;
    const oldestLatest = candidates.reduce((a, b) => (a < b ? a : b));

    return new Date(`${oldestLatest}T00:00:00`);
  }
}

export default Data;

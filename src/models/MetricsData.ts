import type {
  MonthYearKey,
  NpmOrganizationStats,
  NpmPackageStats,
  PrivatePublicCommitStats,
} from '@/types/ComponentStats';
import type { DateKey, HourKey, Month, PublicRepositoryDetails, UserStats, Weekday, Year } from '@/types/GitHubStats';
import type { PackageDetails, PackageStats } from '@/types/NpmStats';

/** Getter surface the cards render from — implemented by Data (stats repos) and LiveData (metrics-api). */
export interface MetricsData {
  fetchData(): Promise<void>;
  readonly hasNpmData: boolean;
  readonly latestDataDate: Date | null;

  // GitHub
  readonly githubUser: UserStats | null;
  readonly githubCommitsPerLanguage: Record<string, number>;
  readonly githubCommitStatTotals: PrivatePublicCommitStats;
  readonly githubCommitStatsPerHour: Partial<Record<HourKey, PrivatePublicCommitStats>>;
  readonly githubCommitStatsPerWeekday: Partial<Record<Weekday, PrivatePublicCommitStats>>;
  readonly githubCommitsPerRepository: Record<string, PrivatePublicCommitStats>;
  readonly githubCommitsPerDate: Partial<Record<DateKey, PrivatePublicCommitStats>>;
  readonly githubCommitsPerYear: Partial<Record<Year, PrivatePublicCommitStats>>;
  readonly githubCommitsPerYearAndRepository: Partial<Record<Year, Record<string, PrivatePublicCommitStats>>>;
  readonly githubCommitsPerMonth: Partial<Record<Month, PrivatePublicCommitStats>>;
  readonly githubLanguagesPerYear: Partial<Record<Year, Record<string, number>>>;
  readonly githubCommitsPerMonthAndYear: Partial<Record<MonthYearKey, PrivatePublicCommitStats>>;
  readonly githubYears: Year[];
  readonly githubPublicRepositories: Record<string, PublicRepositoryDetails>;

  // npm
  readonly npmUsername: string;
  readonly npmTotalDownloads: number;
  readonly npmTotalVersions: number;
  readonly npmPackageCount: number;
  readonly npmOrganizationCount: number;
  readonly npmDownloadsPerDate: Partial<Record<DateKey, number>>;
  readonly npmDownloadsPerYear: Partial<Record<Year, number>>;
  readonly npmDownloadsPerMonthAndYear: Partial<Record<MonthYearKey, number>>;
  readonly npmVersionsPerDate: Partial<Record<DateKey, number>>;
  readonly npmVersionsPerHour: Partial<Record<HourKey, number>>;
  readonly npmVersionsPerWeekday: Partial<Record<Weekday, number>>;
  readonly npmPackageStats: Record<string, NpmPackageStats>;
  readonly npmPackageStatsPerYear: Partial<Record<Year, Record<string, NpmPackageStats>>>;
  readonly npmPackageStatsPerMonthAndYear: Partial<Record<MonthYearKey, Record<string, NpmPackageStats>>>;
  readonly npmPackageDownloadsPerWeek: Record<string, Record<string, number>>;
  readonly npmWeekKeys: DateKey[];
  readonly npmOrganizationPackages: Record<string, string[]>;
  readonly npmPackageWeeklyDownloads: Record<string, number>;
  readonly npmOrganizationStats: Record<string, NpmOrganizationStats>;
  readonly npmOrganizationStatsPerYear: Partial<Record<Year, Record<string, NpmOrganizationStats>>>;
  readonly npmOrganizationStatsPerMonthAndYear: Partial<Record<MonthYearKey, Record<string, NpmOrganizationStats>>>;
  readonly npmPackageDetails: Record<string, PackageDetails>;
  readonly npmYears: Year[];
  readonly npmPackages: PackageStats[];
}

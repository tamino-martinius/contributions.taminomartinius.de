import type { MonthYearKey, NpmOrganizationStats, NpmPackageStats } from '@/types/ComponentStats';
import type { DateKey, HourKey, Weekday, Year } from '@/types/GitHubStats';
import type { AccountStats, PackageDetails } from '@/types/NpmStats';
import { splitDateKey, splitHourKey } from '@/util/recordKey';

export interface NpmAggregates {
  totalDownloads: number;
  totalVersions: number;
  downloadsPerDate: Partial<Record<DateKey, number>>;
  downloadsPerYear: Partial<Record<Year, number>>;
  downloadsPerMonthAndYear: Partial<Record<MonthYearKey, number>>;
  versionsPerDate: Partial<Record<DateKey, number>>;
  versionsPerHour: Partial<Record<HourKey, number>>;
  versionsPerWeekday: Partial<Record<Weekday, number>>;
  packageStats: Record<string, NpmPackageStats>;
  packageStatsPerYear: Partial<Record<Year, Record<string, NpmPackageStats>>>;
  packageStatsPerMonthAndYear: Partial<Record<MonthYearKey, Record<string, NpmPackageStats>>>;
  organizationStats: Record<string, NpmOrganizationStats>;
  organizationStatsPerYear: Partial<Record<Year, Record<string, NpmOrganizationStats>>>;
  organizationStatsPerMonthAndYear: Partial<Record<MonthYearKey, Record<string, NpmOrganizationStats>>>;
  organizationPackages: Record<string, string[]>;
  packageWeeklyDownloads: Record<string, number>;
  packageDownloadsPerWeek: Record<string, Record<string, number>>; // weekKey -> { pkgName -> downloads }
  weekKeys: DateKey[];
  packageDetails: Record<string, PackageDetails>;
  years: Year[];
}

export const emptyNpmAggregates = (): NpmAggregates => ({
  totalDownloads: 0,
  totalVersions: 0,
  downloadsPerDate: {},
  downloadsPerYear: {},
  downloadsPerMonthAndYear: {},
  versionsPerDate: {},
  versionsPerHour: {},
  versionsPerWeekday: {},
  packageStats: {},
  packageStatsPerYear: {},
  packageStatsPerMonthAndYear: {},
  organizationStats: {},
  organizationStatsPerYear: {},
  organizationStatsPerMonthAndYear: {},
  organizationPackages: {},
  packageWeeklyDownloads: {},
  packageDownloadsPerWeek: {},
  weekKeys: [],
  packageDetails: {},
  years: [],
});

export const aggregateNpmStats = (stats: AccountStats): NpmAggregates => {
  const out = emptyNpmAggregates();

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
  for (const [key, count] of Object.entries(stats.user.versionsPerDate)) {
    if (!count) continue;
    const dateKey = key as DateKey;
    const [year] = splitDateKey(dateKey);

    out.versionsPerDate[dateKey] = (out.versionsPerDate[dateKey] ?? 0) + count;

    // Year
    out.downloadsPerYear[year] = out.downloadsPerYear[year] ?? 0;
  }

  for (const [key, count] of Object.entries(stats.user.versionsPerHour)) {
    if (!count) continue;
    const hourKey = key as HourKey;
    const [weekday] = splitHourKey(hourKey);

    out.versionsPerHour[hourKey] = (out.versionsPerHour[hourKey] ?? 0) + count;
    out.versionsPerWeekday[weekday] = (out.versionsPerWeekday[weekday] ?? 0) + count;
  }

  // Aggregate per-package data
  for (const pkg of stats.packages) {
    out.packageDetails[pkg.details.name] = pkg.details;
    const organizationName = pkg.details.name.includes('/') ? pkg.details.name.split('/')[0] : stats.user.username;
    if (!out.organizationStats[organizationName]) {
      out.organizationStats[organizationName] = {
        downloads: 0,
        versions: 0,
        packages: 0,
      };
    }
    out.organizationStats[organizationName].packages += 1;
    if (!out.organizationPackages[organizationName]) {
      out.organizationPackages[organizationName] = [];
    }
    out.organizationPackages[organizationName].push(pkg.details.name);

    let pkgDownloads = 0;
    for (const [key, count] of Object.entries(pkg.downloadsPerDate)) {
      if (!count) continue;
      const dateKey = key as DateKey;
      const [year, month] = splitDateKey(dateKey);
      const monthYearKey = `${year}-${month}` satisfies MonthYearKey;

      pkgDownloads += count;
      out.downloadsPerDate[dateKey] = (out.downloadsPerDate[dateKey] ?? 0) + count;
      out.downloadsPerYear[year] = (out.downloadsPerYear[year] ?? 0) + count;
      out.downloadsPerMonthAndYear[monthYearKey] = (out.downloadsPerMonthAndYear[monthYearKey] ?? 0) + count;

      // Per-package per-year downloads
      if (!out.packageStatsPerYear[year]) {
        out.packageStatsPerYear[year] = {};
      }
      if (!out.packageStatsPerYear[year][pkg.details.name]) {
        out.packageStatsPerYear[year][pkg.details.name] = { downloads: 0, versions: 0 };
      }
      out.packageStatsPerYear[year][pkg.details.name].downloads += count;

      // Per-package per-month-year downloads
      if (!out.packageStatsPerMonthAndYear[monthYearKey]) {
        out.packageStatsPerMonthAndYear[monthYearKey] = {};
      }
      if (!out.packageStatsPerMonthAndYear[monthYearKey][pkg.details.name]) {
        out.packageStatsPerMonthAndYear[monthYearKey][pkg.details.name] = { downloads: 0, versions: 0 };
      }
      out.packageStatsPerMonthAndYear[monthYearKey][pkg.details.name].downloads += count;

      // Per-package per-week downloads
      const date = new Date(dateKey);
      const day = date.getDay(); // 0=Sun
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const monday = new Date(date);
      monday.setDate(date.getDate() + mondayOffset);
      const weekKey =
        `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}` as DateKey;
      if (!out.packageDownloadsPerWeek[weekKey]) {
        out.packageDownloadsPerWeek[weekKey] = {};
      }
      out.packageDownloadsPerWeek[weekKey][pkg.details.name] =
        (out.packageDownloadsPerWeek[weekKey][pkg.details.name] ?? 0) + count;

      // Per-organization per-year downloads
      if (!out.organizationStatsPerYear[year]) {
        out.organizationStatsPerYear[year] = {};
      }
      if (!out.organizationStatsPerYear[year][organizationName]) {
        out.organizationStatsPerYear[year][organizationName] = { downloads: 0, versions: 0, packages: 0 };
      }
      out.organizationStatsPerYear[year][organizationName].downloads += count;

      // Per-organization per-month-year downloads
      if (!out.organizationStatsPerMonthAndYear[monthYearKey]) {
        out.organizationStatsPerMonthAndYear[monthYearKey] = {};
      }
      if (!out.organizationStatsPerMonthAndYear[monthYearKey][organizationName]) {
        out.organizationStatsPerMonthAndYear[monthYearKey][organizationName] = {
          downloads: 0,
          versions: 0,
          packages: 0,
        };
      }
      out.organizationStatsPerMonthAndYear[monthYearKey][organizationName].downloads += count;
    }

    // Per-package per-year versions
    for (const [key, count] of Object.entries(pkg.versionsPerDate)) {
      if (!count) continue;
      const dateKey = key as DateKey;
      const [year, month] = splitDateKey(dateKey);
      const monthYearKey = `${year}-${month}` satisfies MonthYearKey;

      if (!out.packageStatsPerYear[year]) {
        out.packageStatsPerYear[year] = {};
      }
      if (!out.packageStatsPerYear[year][pkg.details.name]) {
        out.packageStatsPerYear[year][pkg.details.name] = { downloads: 0, versions: 0 };
      }
      out.packageStatsPerYear[year][pkg.details.name].versions += count;

      // Per-package per-month-year versions
      if (!out.packageStatsPerMonthAndYear[monthYearKey]) {
        out.packageStatsPerMonthAndYear[monthYearKey] = {};
      }
      if (!out.packageStatsPerMonthAndYear[monthYearKey][pkg.details.name]) {
        out.packageStatsPerMonthAndYear[monthYearKey][pkg.details.name] = { downloads: 0, versions: 0 };
      }
      out.packageStatsPerMonthAndYear[monthYearKey][pkg.details.name].versions += count;

      if (!out.organizationStatsPerYear[year]) {
        out.organizationStatsPerYear[year] = {};
      }
      if (!out.organizationStatsPerYear[year][organizationName]) {
        out.organizationStatsPerYear[year][organizationName] = { downloads: 0, versions: 0, packages: 0 };
      }
      out.organizationStatsPerYear[year][organizationName].versions += count;

      // Per-organization per-month-year versions
      if (!out.organizationStatsPerMonthAndYear[monthYearKey]) {
        out.organizationStatsPerMonthAndYear[monthYearKey] = {};
      }
      if (!out.organizationStatsPerMonthAndYear[monthYearKey][organizationName]) {
        out.organizationStatsPerMonthAndYear[monthYearKey][organizationName] = {
          downloads: 0,
          versions: 0,
          packages: 0,
        };
      }
      out.organizationStatsPerMonthAndYear[monthYearKey][organizationName].versions += count;
    }

    const versionCount = Object.values(pkg.versionsPerDate).reduce<number>((acc, count) => acc + (count ?? 0), 0);

    out.packageStats[pkg.details.name] = {
      downloads: pkgDownloads,
      versions: versionCount,
    };
    out.organizationStats[organizationName].downloads += pkgDownloads;
    out.organizationStats[organizationName].versions += versionCount;
    out.totalDownloads += pkgDownloads;
    out.totalVersions += versionCount;

    // Weekly downloads (last full week Mon-Sun)
    let weeklyDownloads = 0;
    for (const dateKey of lastFullWeekDateKeys) {
      weeklyDownloads += (pkg.downloadsPerDate[dateKey] as number) ?? 0;
    }
    out.packageWeeklyDownloads[pkg.details.name] = weeklyDownloads;
  }

  // Count packages per org per year and per month-year
  for (const pkg of stats.packages) {
    const organizationName = pkg.details.name.includes('/') ? pkg.details.name.split('/')[0] : stats.user.username;

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
    for (const yearKey of Object.keys(out.packageStatsPerYear)) {
      const year = Number(yearKey) as Year;
      if (!out.packageStatsPerYear[year]?.[pkg.details.name]) continue;
      if (!out.organizationStatsPerYear[year]) {
        out.organizationStatsPerYear[year] = {};
      }
      if (!out.organizationStatsPerYear[year][organizationName]) {
        out.organizationStatsPerYear[year][organizationName] = { downloads: 0, versions: 0, packages: 0 };
      }
      out.organizationStatsPerYear[year][organizationName].packages += 1;
    }

    // Count per month-year
    for (const monthYearKey of activeMonths) {
      if (!out.organizationStatsPerMonthAndYear[monthYearKey]) {
        out.organizationStatsPerMonthAndYear[monthYearKey] = {};
      }
      if (!out.organizationStatsPerMonthAndYear[monthYearKey][organizationName]) {
        out.organizationStatsPerMonthAndYear[monthYearKey][organizationName] = {
          downloads: 0,
          versions: 0,
          packages: 0,
        };
      }
      out.organizationStatsPerMonthAndYear[monthYearKey][organizationName].packages += 1;
    }
  }

  // Calculate years
  const allYearKeys = new Set<number>();
  for (const key of Object.keys(out.downloadsPerYear)) {
    allYearKeys.add(Number(key));
  }
  for (const key of Object.keys(out.versionsPerDate)) {
    const [year] = splitDateKey(key as DateKey);
    allYearKeys.add(year);
  }
  if (allYearKeys.size > 0) {
    const minYear = Math.min(...allYearKeys);
    out.years = Array.from({ length: new Date().getFullYear() - minYear + 1 }).map((_x, i) => minYear + i);
  }

  // Sort week keys
  out.weekKeys = (Object.keys(out.packageDownloadsPerWeek) as DateKey[]).sort();

  return out;
};

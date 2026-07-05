import { type FC, useMemo, useState } from 'react';
import { ButtonGroup } from '@/components/shared/ButtonGroup';
import { Chart, ChartType } from '@/components/shared/Chart';
import { Dropdown } from '@/components/shared/Dropdown';
import type { MetricsData } from '@/models/MetricsData';
import type { MonthYearKey } from '@/types/ComponentStats';
import type { DateKey } from '@/types/GitHubStats';
import { getMonthYearKeysForYear } from '@/util/recordKey';
import './NpmOrgPackageTimelineCard.css';

interface NpmOrgPackageTimelineCardProps {
  data: MetricsData;
}

const MAX_PACKAGES = 8;

const MODES = ['Versions', 'Downloads'] as const;
type Mode = (typeof MODES)[number];

export const NpmOrgPackageTimelineCard: FC<NpmOrgPackageTimelineCardProps> = ({ data }) => {
  const {
    npmOrganizationStats,
    npmOrganizationPackages,
    npmPackageStats,
    npmPackageStatsPerMonthAndYear,
    npmPackageDownloadsPerWeek,
    npmWeekKeys: allWeekKeys,
    npmYears: years,
  } = data;

  const orgNames = Object.entries(npmOrganizationStats)
    .sort((a, b) => b[1].downloads - a[1].downloads)
    .map(([name]) => name);

  const [selectedOrg, setSelectedOrg] = useState(orgNames[0]);
  const [mode, setMode] = useState<Mode>(MODES[MODES.length - 1]);

  const isDownloads = mode === 'Downloads';
  const orgPackageNames = npmOrganizationPackages[selectedOrg] ?? [];

  // Weekly keys filtered to this org's packages
  const weekKeys = useMemo(() => {
    if (!isDownloads) return [];
    const startIdx = allWeekKeys.findIndex((wk) =>
      orgPackageNames.some((name) => (npmPackageDownloadsPerWeek[wk]?.[name] ?? 0) > 0),
    );
    return startIdx >= 0 ? allWeekKeys.slice(startIdx) : allWeekKeys;
  }, [isDownloads, allWeekKeys, orgPackageNames, npmPackageDownloadsPerWeek]);

  // Monthly keys filtered to this org's packages
  const monthYearKeys = useMemo(() => {
    if (isDownloads) return [];
    const all = years.flatMap((year) => getMonthYearKeysForYear(year));
    const startIdx = all.findIndex((key) =>
      orgPackageNames.some((name) => {
        const stats = npmPackageStatsPerMonthAndYear[key]?.[name];
        return stats && stats.versions > 0;
      }),
    );
    return startIdx > 0 ? all.slice(startIdx) : all;
  }, [isDownloads, years, orgPackageNames, npmPackageStatsPerMonthAndYear]);

  // Time keys and year derivation
  const timeKeys = isDownloads ? weekKeys : monthYearKeys;
  const visibleYears = [...new Set(timeKeys.map((key) => Number(key.split('-')[0])))];

  // Projection start
  const now = new Date();
  const projectionStartIndex = isDownloads
    ? (() => {
        const day = now.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        const wk =
          `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}` as DateKey;
        return weekKeys.indexOf(wk);
      })()
    : (() => {
        const mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` as MonthYearKey;
        return monthYearKeys.indexOf(mk);
      })();

  const fillFuture = (values: number[]): number[] => {
    if (projectionStartIndex < 0) return values;
    const filled = values.slice();
    const lastKnown = filled[projectionStartIndex] || 0;
    for (let i = projectionStartIndex + 1; i < filled.length; i++) {
      if (filled[i] === 0) filled[i] = lastKnown;
    }
    return filled;
  };

  // Sort packages by total stat value
  const statKey = isDownloads ? 'downloads' : 'versions';
  const sortedPackages = orgPackageNames
    .map((name) => ({ name, total: npmPackageStats[name]?.[statKey] ?? 0 }))
    .filter((pkg) => pkg.total > 0)
    .sort((a, b) => b.total - a.total);

  const topPackages = sortedPackages.slice(0, sortedPackages.length > MAX_PACKAGES ? MAX_PACKAGES - 1 : MAX_PACKAGES);
  const otherPackages = sortedPackages.length > MAX_PACKAGES ? sortedPackages.slice(MAX_PACKAGES - 1) : [];

  const stripOrg = (name: string) => (name.includes('/') ? name.split('/').slice(1).join('/') : name);

  const getValues = (pkgName: string): number[] =>
    isDownloads
      ? fillFuture(weekKeys.map((wk) => npmPackageDownloadsPerWeek[wk]?.[pkgName] ?? 0))
      : fillFuture(monthYearKeys.map((key) => npmPackageStatsPerMonthAndYear[key]?.[pkgName]?.versions ?? 0));

  const graphs = topPackages.map((pkg, i) => ({
    title: stripOrg(pkg.name),
    color: `color-${i + 1}`,
    value: pkg.total,
    values: getValues(pkg.name),
  }));

  if (otherPackages.length > 0) {
    graphs.push({
      title: `${otherPackages.length} Others`,
      color: 'color-0',
      value: otherPackages.reduce((sum, pkg) => sum + pkg.total, 0),
      values: isDownloads
        ? fillFuture(
            weekKeys.map((wk) =>
              otherPackages.reduce((sum, pkg) => sum + (npmPackageDownloadsPerWeek[wk]?.[pkg.name] ?? 0), 0),
            ),
          )
        : fillFuture(
            monthYearKeys.map((key) =>
              otherPackages.reduce(
                (sum, pkg) => sum + (npmPackageStatsPerMonthAndYear[key]?.[pkg.name]?.versions ?? 0),
                0,
              ),
            ),
          ),
    });
  }

  return (
    <Chart
      className="npm-org-package-timeline-card"
      title="Package Timeline"
      type={ChartType.STACKED}
      graphs={graphs}
      xLabels={visibleYears.map(String)}
      yScale={'symlog'}
      titleSlot={
        <div className="npm-org-package-timeline-card__title-controls">
          <ButtonGroup labels={MODES} values={[...MODES]} onValueChanged={setMode} />
          <Dropdown labels={orgNames} values={orgNames} value={selectedOrg} onValueChanged={setSelectedOrg} />
        </div>
      }
      projectionStartIndex={projectionStartIndex >= 0 ? projectionStartIndex : undefined}
    />
  );
};

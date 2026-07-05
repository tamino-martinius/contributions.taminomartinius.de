import { type FC, useState } from 'react';
import { ButtonGroup } from '@/components/shared/ButtonGroup';
import { Chart, ChartType } from '@/components/shared/Chart';
import type { MetricsData } from '@/models/MetricsData';
import type { MonthYearKey } from '@/types/ComponentStats';
import { getMonthYearKeysForYear } from '@/util/recordKey';
import './NpmOrgTimelineCard.css';

interface NpmOrgTimelineCardProps {
  data: MetricsData;
}

const MAX_ORGS = 5;

const MODES = ['Versions', 'Downloads', 'Packages'] as const;
type Mode = (typeof MODES)[number];

export const NpmOrgTimelineCard: FC<NpmOrgTimelineCardProps> = ({ data }) => {
  const { npmOrganizationStats, npmOrganizationStatsPerMonthAndYear, npmYears: years } = data;
  const [mode, setMode] = useState<Mode>(MODES[MODES.length - 1]);

  const statKey = mode === 'Downloads' ? 'downloads' : mode === 'Versions' ? 'versions' : 'packages';

  const sortedOrgs = Object.entries(npmOrganizationStats).sort((a, b) => b[1].downloads - a[1].downloads);

  const topOrgs = sortedOrgs.slice(0, sortedOrgs.length > MAX_ORGS ? MAX_ORGS - 1 : MAX_ORGS);
  const otherOrgs = sortedOrgs.length > MAX_ORGS ? sortedOrgs.slice(MAX_ORGS - 1) : [];

  const monthYearKeys = years.flatMap((year) => getMonthYearKeysForYear(year));

  // Find the projection start: current month index
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` as MonthYearKey;
  const projectionStartIndex = monthYearKeys.indexOf(currentKey);

  // Fill future data with last known value
  const fillFuture = (values: number[]): number[] => {
    if (projectionStartIndex < 0) return values;
    const filled = values.slice();
    const lastKnown = filled[projectionStartIndex] || 0;
    for (let i = projectionStartIndex + 1; i < filled.length; i++) {
      if (filled[i] === 0) filled[i] = lastKnown;
    }
    return filled;
  };

  const graphs = topOrgs.map(([orgName, stats], i) => ({
    title: orgName,
    color: `color-${i + 1}`,
    value: stats[statKey],
    values: fillFuture(monthYearKeys.map((key) => npmOrganizationStatsPerMonthAndYear[key]?.[orgName]?.[statKey] ?? 0)),
  }));

  if (otherOrgs.length > 0) {
    graphs.push({
      title: `${otherOrgs.length} Others`,
      color: 'color-0',
      value: otherOrgs.reduce((sum, [, stats]) => sum + stats[statKey], 0),
      values: fillFuture(
        monthYearKeys.map((key) =>
          otherOrgs.reduce(
            (sum, [orgName]) => sum + (npmOrganizationStatsPerMonthAndYear[key]?.[orgName]?.[statKey] ?? 0),
            0,
          ),
        ),
      ),
    });
  }

  return (
    <Chart
      className="npm-org-timeline-card"
      title="Organization Timeline"
      type={ChartType.STACKED}
      graphs={graphs}
      xLabels={years.map(String)}
      yScale={'symlog'}
      titleSlot={<ButtonGroup labels={MODES} values={[...MODES]} onValueChanged={setMode} />}
      projectionStartIndex={projectionStartIndex >= 0 ? projectionStartIndex : undefined}
    />
  );
};

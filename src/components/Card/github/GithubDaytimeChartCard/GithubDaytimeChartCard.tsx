import { type FC, memo } from 'react';
import { Chart } from '@/components/shared/Chart';
import type { Graph } from '@/types/ComponentStats';
import './GithubDaytimeChartCard.css';
import { HOUR_TITLES, HOURS, WEEKDAY_TITLES_LONG, WEEKDAYS } from '@/constants';
import type { MetricsData } from '@/models/MetricsData';
import { joinHourKey } from '@/util/recordKey';

interface GithubDaytimeChartCardProps {
  data: MetricsData;
}

export const GithubDaytimeChartCard: FC<GithubDaytimeChartCardProps> = memo(({ data }) => {
  const { githubCommitStatsPerHour: commitStatsPerHour, githubCommitStatsPerWeekday: commitStatsPerWeekday } = data;
  const graphs: Graph[] = WEEKDAYS.map((weekday, i) => ({
    title: WEEKDAY_TITLES_LONG[i],
    color: `color-${i + 1}`,
    value: commitStatsPerWeekday[weekday]?.commitCount ?? 0,
    values: HOURS.map((hour) => commitStatsPerHour[joinHourKey(weekday, hour)]?.commitCount ?? 0),
  }));

  return (
    <Chart
      className="github-daytime-chart-card"
      title="Daytime Chart"
      graphs={graphs}
      xLabels={HOUR_TITLES.filter((_, i) => i % 2 === 0)}
    />
  );
});

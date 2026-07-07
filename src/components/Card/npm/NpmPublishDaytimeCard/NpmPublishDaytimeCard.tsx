import { type FC, memo } from 'react';
import { Chart } from '@/components/shared/Chart';
import type { Graph } from '@/types/ComponentStats';
import './NpmPublishDaytimeCard.css';
import { HOUR_TITLES, HOURS, WEEKDAY_TITLES_LONG, WEEKDAYS } from '@/constants';
import type { MetricsData } from '@/models/MetricsData';
import { joinHourKey } from '@/util/recordKey';

interface NpmPublishDaytimeCardProps {
  data: MetricsData;
}

export const NpmPublishDaytimeCard: FC<NpmPublishDaytimeCardProps> = memo(({ data }) => {
  const { npmVersionsPerHour, npmVersionsPerWeekday } = data;
  const graphs: Graph[] = WEEKDAYS.map((weekday, i) => ({
    title: WEEKDAY_TITLES_LONG[i],
    color: `color-${i + 1}`,
    value: npmVersionsPerWeekday[weekday] ?? 0,
    values: HOURS.map((hour) => npmVersionsPerHour[joinHourKey(weekday, hour)] ?? 0),
  }));

  return (
    <Chart
      className="npm-publish-daytime-card"
      title="Publish Daytime Chart"
      graphs={graphs}
      xLabels={HOUR_TITLES.filter((_, i) => i % 2 === 0)}
    />
  );
});

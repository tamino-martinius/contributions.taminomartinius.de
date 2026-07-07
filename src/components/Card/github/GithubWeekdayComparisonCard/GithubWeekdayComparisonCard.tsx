import { type FC, memo } from 'react';
import { Bar, BarType } from '@/components/shared/Bar';
import { Card } from '@/components/shared/Card';
import { Legend } from '@/components/shared/Legend';
import { VISIBILITIES, VISIBILITY_TITLES, WEEKDAY_TITLES_SHORT, WEEKDAYS } from '@/constants';
import type { MetricsData } from '@/models/MetricsData';
import type { DataPoint } from '@/types/ComponentStats';
import { visibilityCommitKey } from '@/util/recordKey';
import './GithubWeekdayComparisonCard.css';

interface GithubWeekdayComparisonCardProps {
  data: MetricsData;
  legendLabel?: string;
}

export const GithubWeekdayComparisonCard: FC<GithubWeekdayComparisonCardProps> = memo(({ data, legendLabel }) => {
  const { githubCommitStatsPerWeekday: commitStatsPerWeekday } = data;
  const maxSum = Math.max(...Object.values(commitStatsPerWeekday).map((counts) => counts.commitCount));

  const bars = WEEKDAYS.map((weekday, i) => (
    <Bar
      key={i}
      sections={VISIBILITIES.map((visibility, j) => ({
        color: `color-${visibility}`,
        title: VISIBILITY_TITLES[j],
        value: commitStatsPerWeekday[weekday]?.[visibilityCommitKey(visibility)] ?? 0,
      }))}
      type={BarType.VERTICAL}
      style={{
        height: `${(((commitStatsPerWeekday[weekday]?.commitCount ?? 0) / maxSum) * 125).toFixed(0)}px`,
      }}
    />
  ));

  const xAxisLabels = WEEKDAY_TITLES_SHORT.map((label, i) => <span key={i}>{label}</span>);

  const sections: DataPoint[] = legendLabel
    ? [{ color: 'color-public', title: legendLabel, value: 0 }]
    : VISIBILITIES.map((visibility, i) => ({
        color: `color-${visibility}`,
        title: VISIBILITY_TITLES[i],
        value: 0,
      }));

  return (
    <Card
      title="Weekday Comparison"
      className="github-weekday-comparison-card"
      footerSlot={<Legend className="github-weekday-comparison-card__legend" sections={sections} />}
    >
      <div className="chart__grid">
        <div className="chart__canvas">{bars}</div>
        <div className="chart__axis chart__axis--x">{xAxisLabels}</div>
      </div>
    </Card>
  );
});

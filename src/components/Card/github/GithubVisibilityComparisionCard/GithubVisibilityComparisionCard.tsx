import { type FC, memo } from 'react';
import { PieChartComparisonCard } from '@/components/shared/PieChartComparisonCard';
import { VISIBILITIES, VISIBILITY_TITLES } from '@/constants';
import type { MetricsData } from '@/models/MetricsData';
import type { DataPoint } from '@/types/ComponentStats';
import { visibilityCommitKey } from '@/util/recordKey';
import './GithubVisibilityComparisionCard.css';

interface GithubVisibilityComparisionCardProps {
  data: MetricsData;
}

export const GithubVisibilityComparisionCard: FC<GithubVisibilityComparisionCardProps> = memo(({ data }) => {
  const { githubCommitStatTotals: commitStatTotals } = data;

  const sections: [DataPoint, DataPoint] = [
    {
      color: `color-${VISIBILITIES[0]}`,
      title: VISIBILITY_TITLES[0],
      value: commitStatTotals[visibilityCommitKey(VISIBILITIES[0])],
    },
    {
      color: `color-${VISIBILITIES[1]}`,
      title: VISIBILITY_TITLES[1],
      value: commitStatTotals[visibilityCommitKey(VISIBILITIES[1])],
    },
  ];

  return (
    <PieChartComparisonCard
      title="Visibility Comparison"
      className="github-visibility-comparison-card"
      sections={sections}
    />
  );
});

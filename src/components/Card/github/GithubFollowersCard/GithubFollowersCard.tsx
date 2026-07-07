import { type FC, memo } from 'react';
import { PieChartComparisonCard } from '@/components/shared/PieChartComparisonCard';
import type { MetricsData } from '@/models/MetricsData';
import type { DataPoint } from '@/types/ComponentStats';
import './GithubFollowersCard.css';

interface GithubFollowersCardProps {
  data: MetricsData;
}

export const GithubFollowersCard: FC<GithubFollowersCardProps> = memo(({ data }) => {
  const user = data.githubUser;

  const sections: [DataPoint, DataPoint] = [
    { color: 'color-followers', title: 'Followers', value: user?.followerCount ?? 0 },
    { color: 'color-following', title: 'Following', value: user?.followingCount ?? 0 },
  ];

  return (
    <PieChartComparisonCard title="Followers vs Following" className="github-followers-card" sections={sections} />
  );
});

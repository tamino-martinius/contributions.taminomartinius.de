import { type FC, memo } from 'react';
import { Bar } from '@/components/shared/Bar';
import { Card } from '@/components/shared/Card';
import { CountTo } from '@/components/shared/CountTo';
import { Legend } from '@/components/shared/Legend';
import type { MetricsData } from '@/models/MetricsData';
import type { DataPoint } from '@/types/ComponentStats';
import '../GithubTotalCountsCard/GithubTotalCountsCard.css';

interface GithubContributionTotalsCardProps {
  data: MetricsData;
}

export const GithubContributionTotalsCard: FC<GithubContributionTotalsCardProps> = memo(({ data }) => {
  const repos = Object.values(data.githubPublicRepositories);

  const sections: DataPoint[] = [
    { color: 'color-1', title: 'Repositories', value: repos.length },
    { color: 'color-2', title: 'Stars', value: repos.reduce((sum, repo) => sum + repo.stargazerCount, 0) },
    { color: 'color-3', title: 'Forks', value: repos.reduce((sum, repo) => sum + repo.forkCount, 0) },
  ];

  return (
    <Card title="Total Counts" className="github-total-counts-card">
      <h3>
        <CountTo inline endVal={data.githubCommitStatTotals.commitCount} /> Contributions
      </h3>
      <h4>In Total</h4>
      <hr />
      <Legend className="github-total-counts-card__legend" sections={sections} />
      <Bar sections={sections} />
    </Card>
  );
});

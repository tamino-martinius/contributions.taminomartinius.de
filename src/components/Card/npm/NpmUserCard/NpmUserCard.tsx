import { type FC, memo } from 'react';
import { Card } from '@/components/shared/Card';
import { Legend } from '@/components/shared/Legend';
import type { DataPoint } from '@/types/ComponentStats';
import './NpmUserCard.css';
import type { MetricsData } from '@/models/MetricsData';

interface NpmUserCardProps {
  data: MetricsData;
}

const MAX_DISPLAYED_ORGANIZATIONS = 4;

export const NpmUserCard: FC<NpmUserCardProps> = memo(({ data }) => {
  const { npmUsername, npmOrganizationStats, npmPackageCount } = data;

  const topOrganizations: DataPoint[] = Object.entries(npmOrganizationStats)
    .filter(([, stats]) => stats.packages > 0)
    .sort((a, b) => b[1].packages - a[1].packages)
    .slice(0, MAX_DISPLAYED_ORGANIZATIONS)
    .map(([name, stats], i) => ({
      color: `color-${i + 1}`,
      title: name,
      value: stats.packages,
    }));

  return (
    <Card title={npmUsername} titleUrl={`https://www.npmjs.com/~${npmUsername}`} className="npm-user-card">
      <h3>{npmPackageCount} Packages</h3>
      <h4>Published on npm</h4>
      <hr />
      <Legend className="npm-user-card__legend" sections={topOrganizations} columns="1fr 1fr" />
    </Card>
  );
});

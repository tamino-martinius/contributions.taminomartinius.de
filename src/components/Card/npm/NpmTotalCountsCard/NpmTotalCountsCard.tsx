import { Bar } from '@/components/shared/Bar';
import { Card } from '@/components/shared/Card';
import { CountTo } from '@/components/shared/CountTo';
import { Legend } from '@/components/shared/Legend';
import type { DataPoint } from '@/types/ComponentStats';
import './NpmTotalCountsCard.css';
import { type FC, memo } from 'react';
import type { MetricsData } from '@/models/MetricsData';

interface NpmTotalCountsCardProps {
  data: MetricsData;
}

export const NpmTotalCountsCard: FC<NpmTotalCountsCardProps> = memo(({ data }) => {
  const { npmTotalDownloads, npmTotalVersions, npmPackageCount, npmOrganizationCount } = data;

  const versions: DataPoint = {
    color: 'color-1',
    title: 'Versions Published',
    value: npmTotalVersions,
  };
  const packages: DataPoint = {
    color: 'color-2',
    title: 'Packages',
    value: npmPackageCount,
  };
  const organizations: DataPoint = {
    color: 'color-3',
    title: 'Organizations',
    value: npmOrganizationCount,
  };

  return (
    <Card title="Total Counts" className="npm-total-counts-card">
      <h3>
        <CountTo inline endVal={npmTotalDownloads} /> Downloads
      </h3>
      <h4>In Total</h4>
      <hr />
      <Legend className="npm-total-counts-card__legend" sections={[versions, packages, organizations]} />
      <Bar sections={[versions, packages, organizations]} />
    </Card>
  );
});

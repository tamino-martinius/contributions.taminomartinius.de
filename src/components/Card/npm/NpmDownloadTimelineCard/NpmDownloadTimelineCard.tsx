import type { FC } from 'react';
import { Chart, ChartType } from '@/components/shared/Chart';
import type { MetricsData } from '@/models/MetricsData';
import { getMonthYearKeysForYear } from '@/util/recordKey';
import './NpmDownloadTimelineCard.css';

interface NpmDownloadTimelineCardProps {
  data: MetricsData;
}

const MAX_PACKAGES = 7;

export const NpmDownloadTimelineCard: FC<NpmDownloadTimelineCardProps> = ({ data }) => {
  const { npmPackageStats, npmPackages, npmYears: years } = data;

  // Get top packages by total downloads
  const topPackageNames = Object.entries(npmPackageStats)
    .filter(([, stats]) => stats.downloads > 0)
    .sort((a, b) => b[1].downloads - a[1].downloads)
    .slice(0, MAX_PACKAGES)
    .map(([name]) => name);

  const graphs = topPackageNames.map((pkgName, i) => {
    const pkg = npmPackages.find((p) => p.details.name === pkgName);
    const values = years.flatMap((year) =>
      getMonthYearKeysForYear(year).map((monthYearKey) => {
        if (!pkg) return 0;
        // Sum downloads for this month from the package's own data
        const [y, m] = monthYearKey.split('-');
        let sum = 0;
        for (const [dateKey, count] of Object.entries(pkg.downloadsPerDate)) {
          if (dateKey.startsWith(`${y}-${m}`) && count) {
            sum += count;
          }
        }
        return sum;
      }),
    );

    return {
      title: pkgName,
      color: `color-${i + 1}`,
      value: npmPackageStats[pkgName]?.downloads ?? 0,
      values,
    };
  });

  return (
    <Chart
      className="npm-download-timeline-card"
      title="Download Timeline"
      type={ChartType.COMPARE}
      graphs={graphs}
      xLabels={years.map(String)}
      yScale={'symlog'}
    />
  );
};

import { type FC, memo } from 'react';
import { Chart } from '@/components/shared/Chart';
import { MONTH_TITLES_SHORT, MONTHS } from '@/constants';
import type { MetricsData } from '@/models/MetricsData';
import type { Graph, MonthYearKey } from '@/types/ComponentStats';
import { getMonthYearKeysForYear } from '@/util/recordKey';
import './NpmDownloadYearCard.css';

const MAX_DISPLAYED_YEARS = 7;

interface NpmDownloadYearCardProps {
  data: MetricsData;
}

export const NpmDownloadYearCard: FC<NpmDownloadYearCardProps> = memo(({ data }) => {
  const { npmDownloadsPerMonthAndYear, npmDownloadsPerYear, npmYears: years } = data;

  const graphs: Graph[] = years
    .slice(-MAX_DISPLAYED_YEARS)
    .reverse()
    .map((year, i) => {
      const downloadsPerMonth = getMonthYearKeysForYear(year).map(
        (monthYearKey) => npmDownloadsPerMonthAndYear[monthYearKey] ?? 0,
      );
      return {
        title: year.toString(),
        color: `color-${i + 1}`,
        value: npmDownloadsPerYear[year] ?? 0,
        values: downloadsPerMonth,
      };
    });

  const additionalYears = years.slice(0, -MAX_DISPLAYED_YEARS);

  if (additionalYears.length > 0) {
    const downloadsPerMonth = MONTHS.map((month) =>
      Math.max(
        ...additionalYears.map((year) => npmDownloadsPerMonthAndYear[`${year}-${month}` satisfies MonthYearKey] ?? 0),
      ),
    );
    graphs.push({
      title:
        additionalYears.length > 1
          ? `${additionalYears[0]} ${additionalYears.length > 2 ? '-' : 'and'} ${additionalYears[additionalYears.length - 1]}`
          : additionalYears[0].toString(),
      color: 'color-0',
      value: Math.max(...additionalYears.map((year) => npmDownloadsPerYear[year] ?? 0)),
      values: downloadsPerMonth,
    });
  }

  return (
    <Chart className="npm-download-year-card" title="Downloads by Year" graphs={graphs} xLabels={MONTH_TITLES_SHORT} />
  );
});

import { type FC, memo } from 'react';
import { Chart } from '@/components/shared/Chart';
import { MONTH_TITLES_SHORT, MONTHS } from '@/constants';
import type { MetricsData } from '@/models/MetricsData';
import type { Graph, MonthYearKey } from '@/types/ComponentStats';
import { getMonthYearKeysForYear } from '@/util/recordKey';
import './GithubYearChartCard.css';

const MAX_DISPLAYED_YEARS = 7;

interface GithubYearChartCardProps {
  data: MetricsData;
}

export const GithubYearChartCard: FC<GithubYearChartCardProps> = memo(({ data }) => {
  const {
    githubCommitsPerMonthAndYear: commitsPerMonthAndYear,
    githubCommitsPerYear: commitsPerYear,
    githubYears: years,
  } = data;
  const graphs: Graph[] = years
    .slice(-MAX_DISPLAYED_YEARS)
    .reverse()
    .map((year, i) => {
      const commitsPerMonth = getMonthYearKeysForYear(year).map(
        (monthYearKey) => commitsPerMonthAndYear[monthYearKey]?.commitCount ?? 0,
      );
      return {
        title: year.toString(),
        color: `color-${i + 1}`,
        value: commitsPerYear[year]?.commitCount ?? 0,
        values: commitsPerMonth,
      };
    });

  const additionalYears = years.slice(0, -MAX_DISPLAYED_YEARS);

  if (additionalYears.length > 0) {
    const commitsPerMonth = MONTHS.map((month) =>
      Math.max(
        ...additionalYears.map(
          (year) => commitsPerMonthAndYear[`${year}-${month}` satisfies MonthYearKey]?.commitCount ?? 0,
        ),
      ),
    );
    graphs.push({
      title:
        additionalYears.length > 1
          ? `${additionalYears[0]} ${additionalYears.length > 2 ? '-' : 'and'} ${additionalYears[additionalYears.length - 1]}`
          : additionalYears[0].toString(),
      color: 'color-0',
      value: Math.max(...additionalYears.map((year) => commitsPerYear[year]?.commitCount ?? 0)),
      values: commitsPerMonth,
    });
  }

  return <Chart className="github-year-chart-card" title="Years Chart" graphs={graphs} xLabels={MONTH_TITLES_SHORT} />;
});

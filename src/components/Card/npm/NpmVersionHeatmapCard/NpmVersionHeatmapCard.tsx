import { type FC, useState } from 'react';
import { Bar } from '@/components/shared/Bar';
import { ButtonGroup } from '@/components/shared/ButtonGroup';
import { Card } from '@/components/shared/Card';
import { CountTo } from '@/components/shared/CountTo';
import { Heatmap } from '@/components/shared/Heatmap';
import { Legend } from '@/components/shared/Legend';
import type { DataPoint } from '@/types/ComponentStats';
import './NpmVersionHeatmapCard.css';
import type { MetricsData } from '@/models/MetricsData';
import { getDateKeysForYear } from '@/util/recordKey';

interface NpmVersionHeatmapCardProps {
  data: MetricsData;
}

const MAX_DISPLAYED_ORGS = 6;

export const NpmVersionHeatmapCard: FC<NpmVersionHeatmapCardProps> = ({ data }) => {
  const { npmVersionsPerDate, npmOrganizationStatsPerYear, npmYears: years } = data;
  const startTimestamp = new Date(Object.keys(npmVersionsPerDate)[0]).getTime();

  const [year, setYear] = useState(years[years.length - 1]);

  const heatmapCounts = getDateKeysForYear(year).map((dateKey) => npmVersionsPerDate[dateKey]);

  const yearTotal = getDateKeysForYear(year).reduce((sum, dateKey) => sum + (npmVersionsPerDate[dateKey] ?? 0), 0);

  const orgsOfYear = npmOrganizationStatsPerYear[year] ?? {};
  const organizations = Object.entries(orgsOfYear)
    .map(([name, stats]) => ({ name, versions: stats.versions }))
    .filter((org) => org.versions > 0)
    .sort((a, b) => b.versions - a.versions);

  const highlightOrgs: DataPoint[] = organizations
    .slice(0, organizations.length > MAX_DISPLAYED_ORGS ? MAX_DISPLAYED_ORGS - 1 : MAX_DISPLAYED_ORGS)
    .map((org, i) => ({
      title: org.name,
      color: `color-${i + 1}`,
      value: org.versions,
    }));

  if (organizations.length > MAX_DISPLAYED_ORGS) {
    highlightOrgs.push({
      title: `${organizations.length - MAX_DISPLAYED_ORGS + 1} Others`,
      color: 'color-0',
      value: organizations.slice(MAX_DISPLAYED_ORGS - 1).reduce((acc, org) => acc + org.versions, 0),
    });
  }

  return (
    <Card
      title="Version Publish Heatmap"
      className="npm-version-heatmap-card"
      titleSlot={
        <ButtonGroup labels={years.map((y) => y.toString().substring(2))} values={years} onValueChanged={setYear} />
      }
    >
      <h3>Year {year}</h3>
      <h4>
        <CountTo duration={500} inline endVal={yearTotal} /> Versions Published
      </h4>
      <hr />
      <h3 className="npm-version-heatmap-card__highlights">Highlights</h3>
      <Heatmap counts={heatmapCounts} year={year} startTimestamp={startTimestamp} endTimestamp={Date.now()} />
      <Legend className="npm-version-heatmap-card__legend" sections={highlightOrgs} />
      <Bar sections={highlightOrgs} sectionCount={MAX_DISPLAYED_ORGS} />
    </Card>
  );
};

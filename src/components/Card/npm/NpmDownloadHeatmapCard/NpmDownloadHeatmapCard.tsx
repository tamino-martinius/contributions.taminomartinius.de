import { type FC, useState } from 'react';
import { ButtonGroup } from '@/components/shared/ButtonGroup';
import { Card } from '@/components/shared/Card';
import { CountTo } from '@/components/shared/CountTo';
import { Heatmap } from '@/components/shared/Heatmap';
import './NpmDownloadHeatmapCard.css';
import type { MetricsData } from '@/models/MetricsData';
import { getDateKeysForYear } from '@/util/recordKey';

interface NpmDownloadHeatmapCardProps {
  data: MetricsData;
}

export const NpmDownloadHeatmapCard: FC<NpmDownloadHeatmapCardProps> = ({ data }) => {
  const { npmDownloadsPerDate, npmDownloadsPerYear, npmYears: years } = data;
  const startTimestamp = new Date(Object.keys(npmDownloadsPerDate)[0]).getTime();

  const [year, setYear] = useState(years[years.length - 1]);

  const heatmapCounts = getDateKeysForYear(year).map((dateKey) => npmDownloadsPerDate[dateKey]);

  return (
    <Card
      title="Download Heatmap"
      className="npm-download-heatmap-card"
      titleSlot={
        <ButtonGroup labels={years.map((y) => y.toString().substring(2))} values={years} onValueChanged={setYear} />
      }
    >
      <h3>Year {year}</h3>
      <h4>
        <CountTo duration={500} inline endVal={npmDownloadsPerYear[year] ?? 0} /> Downloads
      </h4>
      <hr />
      <Heatmap counts={heatmapCounts} year={year} startTimestamp={startTimestamp} endTimestamp={Date.now()} />
    </Card>
  );
};

import { type FC, useState } from 'react';
import { Bar } from '@/components/shared/Bar';
import { ButtonGroup } from '@/components/shared/ButtonGroup';
import { Card } from '@/components/shared/Card';
import { CountTo } from '@/components/shared/CountTo';
import { Heatmap } from '@/components/shared/Heatmap';
import { Legend } from '@/components/shared/Legend';
import type { DataPoint } from '@/types/ComponentStats';
import './GithubYearHeatmapCard.css';
import type { MetricsData } from '@/models/MetricsData';
import { getDateKeysForYear } from '@/util/recordKey';

interface GithubYearHeatmapCardProps {
  data: MetricsData;
  countLabel?: string;
}

const MAX_DISPLAYED_REPOS = 6;

export const GithubYearHeatmapCard: FC<GithubYearHeatmapCardProps> = ({ data, countLabel = 'Commits' }) => {
  const {
    githubCommitsPerDate: commitsPerDate,
    githubCommitsPerYearAndRepository: commitsPerYearAndRepository,
    githubCommitsPerYear: commitsPerYear,
    githubPublicRepositories: publicRepositories,
    githubYears: years,
  } = data;
  const startTimestamp = new Date(Object.keys(commitsPerDate)[0]).getTime();

  const [year, setYear] = useState(years[years.length - 1]);

  const heatmapCounts = getDateKeysForYear(year).map((dateKey) => commitsPerDate[dateKey]?.commitCount);

  const reposOfYear = commitsPerYearAndRepository[year] ?? {};
  const repositories = Object.entries(reposOfYear)
    .map(([name, commitStats]) => ({
      name,
      commitCount: commitStats.commitCount,
    }))
    .sort((a, b) => b.commitCount - a.commitCount);

  const highlightRepositories: DataPoint[] = repositories
    .slice(0, repositories.length > MAX_DISPLAYED_REPOS ? MAX_DISPLAYED_REPOS - 1 : MAX_DISPLAYED_REPOS)
    .map((repo, i) => ({
      title: repo.name,
      color: `color-${i + 1}`,
      value: repo.commitCount,
      url: publicRepositories[repo.name]?.url,
    }));

  if (repositories.length > MAX_DISPLAYED_REPOS) {
    highlightRepositories.push({
      title: `${repositories.length - MAX_DISPLAYED_REPOS + 1} Others`,
      color: 'color-0',
      value: repositories.slice(MAX_DISPLAYED_REPOS - 1).reduce((acc, repo) => acc + repo.commitCount, 0),
    });
  }

  return (
    <Card
      title="Heatmap"
      className="github-year-heatmap-card"
      titleSlot={
        <ButtonGroup labels={years.map((y) => y.toString().substring(2))} values={years} onValueChanged={setYear} />
      }
    >
      <h3>Year {year}</h3>
      <h4>
        <CountTo duration={500} inline endVal={commitsPerYear[year]?.commitCount ?? 0} /> {countLabel}
      </h4>
      <hr />
      <h3 className="github-year-heatmap-card__highlights">Highlights</h3>
      <Heatmap counts={heatmapCounts} year={year} startTimestamp={startTimestamp} endTimestamp={Date.now()} />
      <Legend className="github-year-heatmap-card__legend" sections={highlightRepositories} />
      <Bar sections={highlightRepositories} sectionCount={MAX_DISPLAYED_REPOS} />
    </Card>
  );
};

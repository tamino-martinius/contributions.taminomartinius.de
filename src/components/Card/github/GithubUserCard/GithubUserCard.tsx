import { type FC, memo } from 'react';
import { Card } from '@/components/shared/Card';
import { Legend } from '@/components/shared/Legend';
import type { DataPoint } from '@/types/ComponentStats';
import { GithubBio } from './GithubBio';
import './GithubUserCard.css';
import type { MetricsData } from '@/models/MetricsData';

interface GithubUserCardProps {
  data: MetricsData;
}

export const GithubUserCard: FC<GithubUserCardProps> = memo(({ data }) => {
  const {
    githubCommitsPerLanguage: commitsPerLanguage,
    githubCommitStatTotals: commitStatTotals,
    githubUser: user,
  } = data;

  if (!user) return null;

  const topLanguages: DataPoint[] = Object.entries(commitsPerLanguage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([language, commitCount], i) => ({
      color: `color-${i + 1}`,
      title: language,
      value: commitCount / commitStatTotals.publicCommitCount,
    }));

  return (
    <Card
      title={user.name}
      titleUrl={user.url}
      className="github-user-card"
      titleSlot={<img src={user.avatarUrl} alt={user.name} className="github-user-card__avatar" />}
    >
      <GithubBio user={user} />
      <hr />
      <Legend decimals={2} className="github-user-card__legend" sections={topLanguages} columns="1fr 1fr" />
    </Card>
  );
});

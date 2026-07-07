import { type FC, memo, useState } from 'react';
import { Bar } from '@/components/shared/Bar';
import { ButtonGroup } from '@/components/shared/ButtonGroup';
import { Card } from '@/components/shared/Card';
import { CountTo } from '@/components/shared/CountTo';
import type { MetricsData } from '@/models/MetricsData';
import type { PublicRepositoryDetails } from '@/types/GitHubStats';
import './GithubPopularReposCard.css';

interface GithubPopularReposCardProps {
  data: MetricsData;
}

const MAX_DISPLAYED_REPOS = 6;

const MODES = ['Forks', 'Stargazers'] as const;
type Mode = (typeof MODES)[number];

interface RepoItem {
  name: string;
  description?: string;
  url?: string;
  color: string;
  value: number;
}

export const GithubPopularReposCard: FC<GithubPopularReposCardProps> = memo(({ data }) => {
  const { githubPublicRepositories: publicRepositories } = data;
  const [mode, setMode] = useState<Mode>(MODES[MODES.length - 1]);

  const getValue = (repo: PublicRepositoryDetails) => (mode === 'Stargazers' ? repo.stargazerCount : repo.forkCount);

  const allRepos = Object.values(publicRepositories)
    .filter((repo) => getValue(repo) > 0)
    .sort((a, b) => getValue(b) - getValue(a));

  const items: RepoItem[] = allRepos
    .slice(0, allRepos.length > MAX_DISPLAYED_REPOS ? MAX_DISPLAYED_REPOS - 1 : MAX_DISPLAYED_REPOS)
    .map((repo, i) => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      color: `color-${i + 1}`,
      value: getValue(repo),
    }));

  if (allRepos.length > MAX_DISPLAYED_REPOS) {
    const others = allRepos.slice(MAX_DISPLAYED_REPOS - 1);
    items.push({
      name: 'Others',
      description: `${others.length} more repositories`,
      color: 'color-0',
      value: others.reduce((sum, repo) => sum + getValue(repo), 0),
    });
  }

  const maxCount = Math.max(...items.map((item) => item.value));

  return (
    <Card
      title="Popular Repositories"
      className="github-popular-repos-card"
      titleSlot={<ButtonGroup labels={MODES} values={[...MODES]} onValueChanged={setMode} />}
    >
      <div className="github-popular-repos-card__list">
        {items.map((item, i) => {
          const content = (
            <>
              <div
                className="github-popular-repos-card__color"
                style={{ '--color': `var(--${item.color})` } as React.CSSProperties}
              />
              <div className="github-popular-repos-card__info">
                <div className="github-popular-repos-card__name">{item.name}</div>
                <div className="github-popular-repos-card__description">{item.description || '\u00A0'}</div>
              </div>
              <div className="github-popular-repos-card__bar">
                <Bar
                  sections={
                    item.value === maxCount
                      ? [{ title: item.name, color: item.color, value: item.value }]
                      : [
                          { title: item.name, color: item.color, value: item.value },
                          { title: '', color: 'color-border-dark', value: maxCount - item.value },
                        ]
                  }
                  sectionCount={2}
                />
              </div>
              <div className="github-popular-repos-card__count">
                <CountTo duration={Math.random() * 1000 + 500} endVal={item.value} />
              </div>
            </>
          );

          return item.url ? (
            <a key={i} className="github-popular-repos-card__item" href={item.url} target="_blank" rel="noreferrer">
              {content}
            </a>
          ) : (
            <div key={i} className="github-popular-repos-card__item">
              {content}
            </div>
          );
        })}
      </div>
    </Card>
  );
});

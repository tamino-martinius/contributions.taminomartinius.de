import { type FC, memo, useState } from 'react';
import { Bar } from '@/components/shared/Bar';
import { ButtonGroup } from '@/components/shared/ButtonGroup';
import { Card } from '@/components/shared/Card';
import { CountTo } from '@/components/shared/CountTo';
import type { MetricsData } from '@/models/MetricsData';
import './NpmPopularPackagesCard.css';

interface NpmPopularPackagesCardProps {
  data: MetricsData;
}

const MAX_DISPLAYED_PACKAGES = 8;

interface PackageItem {
  name: string;
  description?: string;
  url?: string;
  color: string;
  value: number;
}

type YearFilter = 'total' | number;

const MODES = ['Versions', 'Downloads'] as const;
type Mode = (typeof MODES)[number];

export const NpmPopularPackagesCard: FC<NpmPopularPackagesCardProps> = memo(({ data }) => {
  const { npmPackageStats, npmPackageStatsPerYear, npmPackageDetails, npmYears } = data;

  const yearValues: YearFilter[] = ['total', ...npmYears];
  const yearLabels = ['Total', ...npmYears.map((y) => y.toString().substring(2))];
  const [selectedYear, setSelectedYear] = useState<YearFilter>(npmYears[npmYears.length - 1]);
  const [mode, setMode] = useState<Mode>(MODES[MODES.length - 1]);

  const statKey = mode === 'Downloads' ? 'downloads' : 'versions';

  const getValue = (name: string): number => {
    if (selectedYear === 'total') return npmPackageStats[name]?.[statKey] ?? 0;
    return npmPackageStatsPerYear[selectedYear as number]?.[name]?.[statKey] ?? 0;
  };

  const allPackages = Object.keys(npmPackageStats)
    .map((name) => ({ name, value: getValue(name) }))
    .filter((pkg) => pkg.value > 0)
    .sort((a, b) => b.value - a.value);

  const items: PackageItem[] = allPackages
    .slice(0, allPackages.length > MAX_DISPLAYED_PACKAGES ? MAX_DISPLAYED_PACKAGES - 1 : MAX_DISPLAYED_PACKAGES)
    .map((pkg, i) => ({
      name: pkg.name,
      description: npmPackageDetails[pkg.name]?.description,
      url: npmPackageDetails[pkg.name]?.links.npm,
      color: `color-${i + 1}`,
      value: pkg.value,
    }));

  if (allPackages.length > MAX_DISPLAYED_PACKAGES) {
    const others = allPackages.slice(MAX_DISPLAYED_PACKAGES - 1);
    items.push({
      name: 'Others',
      description: `${others.length} more packages`,
      color: 'color-0',
      value: others.reduce((sum, pkg) => sum + pkg.value, 0),
    });
  }

  const maxCount = Math.max(...items.map((item) => item.value));

  return (
    <Card
      title="Popular Packages"
      className="npm-popular-packages-card"
      titleSlot={
        <div className="npm-popular-packages-card__title-controls">
          <ButtonGroup labels={MODES} values={[...MODES]} onValueChanged={setMode} />
          <ButtonGroup labels={yearLabels} values={yearValues} onValueChanged={setSelectedYear} />
        </div>
      }
    >
      <div className="npm-popular-packages-card__list">
        {items.map((item, i) => {
          const content = (
            <>
              <div
                className="npm-popular-packages-card__color"
                style={{ '--color': `var(--${item.color})` } as React.CSSProperties}
              />
              <div className="npm-popular-packages-card__info">
                <div className="npm-popular-packages-card__name">{item.name}</div>
                <div className="npm-popular-packages-card__description">{item.description || '\u00A0'}</div>
              </div>
              <div className="npm-popular-packages-card__bar">
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
              <div className="npm-popular-packages-card__count">
                <CountTo duration={Math.random() * 1000 + 500} endVal={item.value} />
              </div>
            </>
          );

          return item.url ? (
            <a key={i} className="npm-popular-packages-card__item" href={item.url} target="_blank" rel="noreferrer">
              {content}
            </a>
          ) : (
            <div key={i} className="npm-popular-packages-card__item">
              {content}
            </div>
          );
        })}
      </div>
    </Card>
  );
});

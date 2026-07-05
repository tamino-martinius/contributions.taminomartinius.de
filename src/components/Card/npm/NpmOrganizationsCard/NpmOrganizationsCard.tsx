import { type FC, memo, useState } from 'react';
import { Bar } from '@/components/shared/Bar';
import { ButtonGroup } from '@/components/shared/ButtonGroup';
import { Card } from '@/components/shared/Card';
import { CountTo } from '@/components/shared/CountTo';
import type { MetricsData } from '@/models/MetricsData';
import './NpmOrganizationsCard.css';

interface NpmOrganizationsCardProps {
  data: MetricsData;
}

const MAX_DISPLAYED_ORGS = 6;

interface OrgItem {
  name: string;
  description?: string;
  color: string;
  value: number;
}

type YearFilter = 'total' | number;

const MODES = ['Versions', 'Downloads', 'Packages'] as const;
type Mode = (typeof MODES)[number];

export const NpmOrganizationsCard: FC<NpmOrganizationsCardProps> = memo(({ data }) => {
  const { npmOrganizationStats, npmOrganizationStatsPerYear, npmYears } = data;

  const yearValues: YearFilter[] = ['total', ...npmYears];
  const yearLabels = ['Total', ...npmYears.map((y) => y.toString().substring(2))];
  const [selectedYear, setSelectedYear] = useState<YearFilter>(npmYears[npmYears.length - 1]);
  const [mode, setMode] = useState<Mode>(MODES[MODES.length - 1]);

  const statKey = mode === 'Downloads' ? 'downloads' : mode === 'Versions' ? 'versions' : 'packages';

  const getValue = (name: string): number => {
    if (selectedYear === 'total') return npmOrganizationStats[name]?.[statKey] ?? 0;
    return npmOrganizationStatsPerYear[selectedYear as number]?.[name]?.[statKey] ?? 0;
  };

  const allOrgs = Object.keys(npmOrganizationStats)
    .map((name) => ({ name, value: getValue(name) }))
    .filter((org) => org.value > 0)
    .sort((a, b) => b.value - a.value);

  const items: OrgItem[] = allOrgs
    .slice(0, allOrgs.length > MAX_DISPLAYED_ORGS ? MAX_DISPLAYED_ORGS - 1 : MAX_DISPLAYED_ORGS)
    .map((org, i) => ({
      name: org.name,
      description: `${npmOrganizationStats[org.name]?.packages ?? 0} packages`,
      color: `color-${i + 1}`,
      value: org.value,
    }));

  if (allOrgs.length > MAX_DISPLAYED_ORGS) {
    const others = allOrgs.slice(MAX_DISPLAYED_ORGS - 1);
    items.push({
      name: 'Others',
      description: `${others.length} more organizations`,
      color: 'color-0',
      value: others.reduce((sum, org) => sum + org.value, 0),
    });
  }

  const maxCount = Math.max(...items.map((item) => item.value));

  return (
    <Card
      title="Organizations"
      className="npm-organizations-card"
      titleSlot={
        <div className="npm-organizations-card__title-controls">
          <ButtonGroup labels={MODES} values={[...MODES]} onValueChanged={setMode} />
          <ButtonGroup labels={yearLabels} values={yearValues} onValueChanged={setSelectedYear} />
        </div>
      }
    >
      <div className="npm-organizations-card__list">
        {items.map((item, i) => (
          <div key={i} className="npm-organizations-card__item">
            <div
              className="npm-organizations-card__color"
              style={{ '--color': `var(--${item.color})` } as React.CSSProperties}
            />
            <div className="npm-organizations-card__info">
              <div className="npm-organizations-card__name">{item.name}</div>
              <div className="npm-organizations-card__description">{item.description || '\u00A0'}</div>
            </div>
            <div className="npm-organizations-card__bar">
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
            <div className="npm-organizations-card__count">
              <CountTo duration={Math.random() * 1000 + 500} endVal={item.value} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

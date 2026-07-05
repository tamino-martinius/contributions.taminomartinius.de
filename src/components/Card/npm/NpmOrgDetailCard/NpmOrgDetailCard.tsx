import { type FC, memo, useState } from 'react';
import { Bar } from '@/components/shared/Bar';
import { ButtonGroup } from '@/components/shared/ButtonGroup';
import { Card } from '@/components/shared/Card';
import { CountTo } from '@/components/shared/CountTo';
import { Dropdown } from '@/components/shared/Dropdown';
import { Legend } from '@/components/shared/Legend';
import type { MetricsData } from '@/models/MetricsData';
import type { DataPoint } from '@/types/ComponentStats';
import './NpmOrgDetailCard.css';

interface NpmOrgDetailCardProps {
  data: MetricsData;
}

const MAX_DISPLAYED_PACKAGES = 5;

const MODES = ['Versions', 'Weekly', 'Downloads'] as const;
type Mode = (typeof MODES)[number];

interface PackageItem {
  name: string;
  description?: string;
  url?: string;
  color: string;
  value: number;
}

export const NpmOrgDetailCard: FC<NpmOrgDetailCardProps> = memo(({ data }) => {
  const {
    npmOrganizationStats,
    npmOrganizationPackages,
    npmPackageStats,
    npmPackageWeeklyDownloads,
    npmPackageDetails,
  } = data;

  const orgNames = Object.entries(npmOrganizationStats)
    .sort((a, b) => b[1].downloads - a[1].downloads)
    .map(([name]) => name);

  const [selectedOrg, setSelectedOrg] = useState(orgNames[0]);
  const [mode, setMode] = useState<Mode>(MODES[MODES.length - 1]);

  const orgStats = npmOrganizationStats[selectedOrg];
  const orgPackageNames = npmOrganizationPackages[selectedOrg] ?? [];

  // Compute org weekly downloads
  const orgWeeklyDownloads = orgPackageNames.reduce((sum, name) => sum + (npmPackageWeeklyDownloads[name] ?? 0), 0);

  // Totals
  const totals: DataPoint[] = [
    { color: 'color-1', title: 'Packages', value: orgStats?.packages ?? 0 },
    { color: 'color-2', title: 'Total Downloads', value: orgStats?.downloads ?? 0 },
    { color: 'color-3', title: 'Total Versions', value: orgStats?.versions ?? 0 },
    { color: 'color-4', title: 'Weekly Downloads', value: orgWeeklyDownloads },
  ];

  const getPackageValue = (name: string): number => {
    if (mode === 'Downloads') return npmPackageStats[name]?.downloads ?? 0;
    if (mode === 'Weekly') return npmPackageWeeklyDownloads[name] ?? 0;
    return npmPackageStats[name]?.versions ?? 0;
  };

  // Top packages by selected mode
  const allPackages = orgPackageNames
    .map((name) => ({ name, value: getPackageValue(name) }))
    .filter((pkg) => pkg.value > 0)
    .sort((a, b) => b.value - a.value);

  const stripOrg = (name: string) => (name.includes('/') ? name.split('/').slice(1).join('/') : name);

  const items: PackageItem[] = allPackages
    .slice(0, allPackages.length > MAX_DISPLAYED_PACKAGES ? MAX_DISPLAYED_PACKAGES - 1 : MAX_DISPLAYED_PACKAGES)
    .map((pkg, i) => ({
      name: stripOrg(pkg.name),
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

  const maxCount = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card
      title="Organization Details"
      className="npm-org-detail-card"
      titleSlot={
        <div className="npm-org-detail-card__title-controls">
          <ButtonGroup labels={MODES} values={[...MODES]} onValueChanged={setMode} />
          <Dropdown labels={orgNames} values={orgNames} value={selectedOrg} onValueChanged={setSelectedOrg} />
        </div>
      }
    >
      <Legend className="npm-org-detail-card__totals" sections={totals} columns="1fr 1fr" />
      <hr />
      <div className="npm-org-detail-card__list">
        {items.map((item, i) => {
          const content = (
            <>
              <div
                className="npm-org-detail-card__color"
                style={{ '--color': `var(--${item.color})` } as React.CSSProperties}
              />
              <div className="npm-org-detail-card__info">
                <div className="npm-org-detail-card__name">{item.name}</div>
                <div className="npm-org-detail-card__description">{item.description || '\u00A0'}</div>
              </div>
              <div className="npm-org-detail-card__bar">
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
              <div className="npm-org-detail-card__count">
                <CountTo duration={Math.random() * 1000 + 500} endVal={item.value} />
              </div>
            </>
          );

          return item.url ? (
            <a key={i} className="npm-org-detail-card__item" href={item.url} target="_blank" rel="noreferrer">
              {content}
            </a>
          ) : (
            <div key={i} className="npm-org-detail-card__item">
              {content}
            </div>
          );
        })}
      </div>
    </Card>
  );
});

import { type FC, useState } from 'react';
import { Chart, ChartType } from '@/components/shared/Chart';
import {
  CHANGE_TYPE_TITLES,
  CHANGE_TYPES,
  HOUR_KEYS,
  VISIBILITIES,
  VISIBILITY_TITLES,
  WEEKDAY_TITLES_LONG,
} from '@/constants';
import type { MetricsData } from '@/models/MetricsData';
import type { Graph } from '@/types/ComponentStats';
import { changeTypeCommitKey, visibilityChangedFilesKey, visibilityCommitKey } from '@/util/recordKey';
import './GithubWeekdayChartCard.css';
import { ButtonGroup } from '@/components/shared/ButtonGroup';

interface GithubWeekdayChartCardProps {
  data: MetricsData;
}

const MODES = ['Change Type', 'Changed Files', 'Commits'] as const;
type Mode = (typeof MODES)[number];

export const GithubWeekdayChartCard: FC<GithubWeekdayChartCardProps> = ({ data }) => {
  const { githubCommitStatsPerHour: commitStatsPerHour, githubCommitStatTotals: commitStatTotals } = data;

  const [mode, setMode] = useState<Mode>(MODES[MODES.length - 1]);

  const graphs: Graph[] =
    mode === 'Commits' || mode === 'Changed Files'
      ? VISIBILITIES.map((type, i) => ({
          title: VISIBILITY_TITLES[i],
          color: `color-${type}`,
          value: commitStatTotals[(mode === 'Commits' ? visibilityCommitKey : visibilityChangedFilesKey)(type)] ?? 0,
          values: HOUR_KEYS.map(
            (hourKey) =>
              commitStatsPerHour[hourKey]?.[
                (mode === 'Commits' ? visibilityCommitKey : visibilityChangedFilesKey)(type)
              ] ?? 0,
          ),
        }))
      : CHANGE_TYPES.map((changeType, i) => ({
          title: CHANGE_TYPE_TITLES[i],
          color: `color-${changeType}`,
          value: commitStatTotals[changeTypeCommitKey(changeType)],
          values: HOUR_KEYS.map((hourKey) => commitStatsPerHour[hourKey]?.[changeTypeCommitKey(changeType)] ?? 0),
        }));

  return (
    <Chart
      className="github-weekday-chart-card"
      title="Weekday Chart"
      type={ChartType.COMPARE}
      graphs={graphs}
      xLabels={WEEKDAY_TITLES_LONG}
      titleSlot={<ButtonGroup labels={MODES} values={[...MODES]} onValueChanged={setMode} />}
    />
  );
};

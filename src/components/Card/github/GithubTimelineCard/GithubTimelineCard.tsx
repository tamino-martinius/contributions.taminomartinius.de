import { type FC, useState } from 'react';
import { Chart, ChartType } from '@/components/shared/Chart';
import { CHANGE_TYPE_TITLES, CHANGE_TYPES, VISIBILITIES, VISIBILITY_TITLES } from '@/constants';
import type { MetricsData } from '@/models/MetricsData';
import {
  changeTypeCommitKey,
  getMonthYearKeysForYear,
  visibilityChangedFilesKey,
  visibilityCommitKey,
} from '@/util/recordKey';
import './GithubTimelineCard.css';
import { ButtonGroup } from '@/components/shared/ButtonGroup';

interface GithubTimelineCardProps {
  data: MetricsData;
}

const MODES = ['Change Type', 'Changed Files', 'Commits'] as const;
type Mode = (typeof MODES)[number];

export const GithubTimelineCard: FC<GithubTimelineCardProps> = ({ data }) => {
  const {
    githubCommitsPerMonthAndYear: commitsPerMonthAndYear,
    githubCommitStatTotals: commitStatTotals,
    githubYears: years,
  } = data;

  const [mode, setMode] = useState<Mode>(MODES[MODES.length - 1]);

  const graphs =
    mode === 'Commits' || mode === 'Changed Files'
      ? VISIBILITIES.map((visibility, i) => {
          return {
            title: VISIBILITY_TITLES[i],
            color: `color-${visibility}`,
            value: commitStatTotals[(mode === 'Commits' ? visibilityCommitKey : visibilityChangedFilesKey)(visibility)],
            values: years.flatMap((year) =>
              getMonthYearKeysForYear(year).map(
                (monthYearKey) =>
                  commitsPerMonthAndYear[monthYearKey]?.[
                    (mode === 'Commits' ? visibilityCommitKey : visibilityChangedFilesKey)(visibility)
                  ] ?? 0,
              ),
            ),
          };
        })
      : CHANGE_TYPES.map((changeType, i) => {
          return {
            title: CHANGE_TYPE_TITLES[i],
            color: `color-${changeType}`,
            value: commitStatTotals[changeTypeCommitKey(changeType)],
            values: years.flatMap((year) =>
              getMonthYearKeysForYear(year).map(
                (monthYearKey) => commitsPerMonthAndYear[monthYearKey]?.[changeTypeCommitKey(changeType)] ?? 0,
              ),
            ),
          };
        });

  return (
    <Chart
      className="github-timeline-card"
      title="Timeline"
      type={ChartType.COMPARE}
      graphs={graphs}
      xLabels={years.map(String)}
      yScale={'linear'}
      titleSlot={<ButtonGroup labels={MODES} values={[...MODES]} onValueChanged={setMode} />}
    />
  );
};

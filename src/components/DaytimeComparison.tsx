import { Vue, Component, Prop } from 'vue-property-decorator';
import Chart, { ChartType } from '@/components/Chart';
import { Dict, Graph, WeekDayStats, CommitSplit } from '@/types';

@Component
export default class extends Vue {
  @Prop() weekDays!: CommitSplit<Dict<WeekDayStats>>;

  render() {
    const hours = Array.from({ length: 24 }).map((x, i) => i);
    const weekDays = Array.from({ length: 7 }).map((x, i) => i);
    const openValues = Array.from({ length: 168 }).map(() => 0);
    const closedValues = Array.from({ length: 168 }).map(() => 0);
    for (const weekDay of weekDays) {
      for (const hour of hours) {
        const openHour = this.weekDays.open[weekDay.toString()].hours[hour.toString()];
        if (openHour) openValues[weekDay * 24 + hour] += openHour.commitCount;
        const closedHour = this.weekDays.closed[weekDay.toString()].hours[hour.toString()];
        if (closedHour) closedValues[weekDay * 24 + hour] += closedHour.commitCount;
      }
    }

    const openValue = openValues.reduce((sum, value) => sum + value, 0);
    const closedValue = closedValues.reduce((sum, value) => sum + value, 0);

    const openGraph: Graph = {
      title: 'Open Source',
      color: 'color-open',
      value: openValue,
      values: openValues,
    };
    const closedGraph: Graph = {
      title: 'Private',
      color: 'color-closed',
      value: closedValue,
      values: closedValues,
    };
    const graphs = [openGraph, closedGraph];

    const xLabels = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    return (
      <Chart
        class="daytime-comparison"
        title="Daytime Comparison"
        type={ChartType.COMPARE}
        graphs={graphs}
        xLabels={xLabels}
      />
    );
  }
}

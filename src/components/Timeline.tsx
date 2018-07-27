import { Vue, Component, Prop } from 'vue-property-decorator';
import Chart, { ChartType } from '@/components/Chart';
import { Dict, Graph, Counts, CommitSplit } from '@/types';

const GROUP_SIZE = 24;

@Component
export default class extends Vue {
  @Prop() dates!: CommitSplit<Dict<Counts>>;

  render() {
    let openValues: number[] = [];
    let closedValues: number[] = [];

    const firstDate = new Date('2013');
    const lastDate = new Date();
    let date = new Date(firstDate);
    while (date < lastDate) {
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const openCount = this.dates.open[key];
      const closedCount = this.dates.closed[key];
      openValues.push(openCount ? openCount.commitCount : 0);
      closedValues.push(closedCount ? closedCount.commitCount : 0);
      date.setDate(date.getDate() + 1);
    }

    openValues = openValues.reduce<number[]>(
      (arr, value, i) => {
        arr[~~(i / GROUP_SIZE)] = (arr[~~(i / GROUP_SIZE)] || 0) + value;
        return arr;
      },
      [],
    );
    closedValues = closedValues.reduce<number[]>(
      (arr, value, i) => {
        arr[~~(i / GROUP_SIZE)] = (arr[~~(i / GROUP_SIZE)] || 0) + value;
        return arr;
      },
      [],
    );

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
    const xLabels: string[] = [];
    date = new Date(firstDate);
    while (date < lastDate) {
      xLabels.push(`${date.getFullYear()}-${date.getMonth() + 1}`);
      date.setMonth(date.getMonth() + 6);
    }

    return (
      <Chart
        class="timeline"
        title="Timeline"
        type={ChartType.COMPARE}
        graphs={graphs}
        xLabels={xLabels}
      />
    );
  }
}

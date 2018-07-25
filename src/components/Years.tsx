// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Chart from '@/components/Chart';
import { Dict, Graph, Counts } from '@/types';

@Component
export default class extends Vue {
  @Prop() dates!: Dict<Counts>;

  render() {
    const years = Array.from({ length: new Date().getFullYear() - 2013 + 1 }).map(
      (x, i) => 2013 + i,
    );
    const graphs = years.map((year, i) => {
      let sum = 0;
      const graph: Graph = {
        title: year.toString(),
        color: `color-${i + 1}`,
        value: 0,
        values: [],
      };
      const date = new Date(year.toString());
      const lastDate = new Date(year, 11, 31, 23, 59, 59);
      while (date < lastDate) {
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const count = this.dates[key];
        const value = count ? count.commitCount : 0;
        graph.values.push(value);
        sum += value;
        date.setDate(date.getDate() + 1);
      }
      graph.value = sum;

      return graph;
    });

    const xLabels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    return (
      <Chart
        class="years"
        title="Years"
        graphs={graphs}
        xLabels={xLabels}
      />
    );
  }
}

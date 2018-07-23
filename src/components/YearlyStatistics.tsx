// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Bar from '@/components/Bar';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { Totals, DataPoint, Dict } from '@/types';

@Component
export default class extends Vue {
  @Prop() yearlyTopRepositories!: Dict<DataPoint[]>;
  @Prop() yearlyTotals!: Dict<Totals>;
  @Prop() dailyTotals!: Dict<Totals>;
  @Prop() year!: string;

  render() {
    const year = this.year || new Date().getFullYear().toString();
    const sections = this.yearlyTopRepositories[year] || [];
    const totals = this.yearlyTotals[year] || { commitCount: 0 };

    const legend = sections.map(data => (
      <Legend data={data} />
    ));

    return (
      <Card title="Yearly Statistics" class="yearly-statistics">
        <h3>
          Year {year}
        </h3>
        <h4>
          {totals.commitCount.toLocaleString()} Commits
        </h4>
        <hr />
        <div class="statistics__legend">
          {legend}
        </div>
        <Bar sections={sections} />
      </Card>
    );
  }
}

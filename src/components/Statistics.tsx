// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Bar from '@/components/Bar';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { Totals, DataPoint } from '@/types';

@Component
export default class extends Vue {
  @Prop() totals!: Totals;

  render() {
    const sections: DataPoint[] = [
      { color: 'color-1', title: 'Additions', value: this.totals.additions },
      { color: 'color-2', title: 'Deletions', value: this.totals.deletions },
      { color: 'color-3', title: 'Changed Files', value: this.totals.changedFiles },
    ];

    const legend = sections.map(data => (
      <Legend data={data} />
    ));

    return (
      <Card title="Statistics" class="statistics">
        <h3>
          {this.totals.commitCount.toLocaleString()} Commits
        </h3>
        <h4>
          In Total
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

// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { Totals, DataPoint } from '@/types';

@Component
export default class extends Vue {
  @Prop() totals!: Totals;

  render() {
    const additionsStr = this.totals.additions.toLocaleString();
    const changedFilesStr = this.totals.changedFiles.toLocaleString();
    const commitCountStr = this.totals.commitCount.toLocaleString();
    const deletionsStr = this.totals.deletions.toLocaleString();

    const sections: DataPoint[] = [
      { color: 'color-1', title: 'Additions', value: additionsStr },
      { color: 'color-2', title: 'Deletions', value: deletionsStr },
      { color: 'color-3', title: 'Changed Files', value: changedFilesStr },
    ];

    const legend = sections.map(data => (
      <Legend data={data} />
    ));

    return (
      <Card title="Statistics" class="statistics">
        <h3>
          {commitCountStr} Commits
        </h3>
        <h4>
          In Total
        </h4>
        <hr />
        <div class="statistics__legend">
          {legend}
        </div>
      </Card>
    );
  }
}

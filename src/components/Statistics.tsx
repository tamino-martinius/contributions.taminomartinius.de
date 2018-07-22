// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { Totals } from '@/types';

@Component
export default class extends Vue {
  @Prop() totals!: Totals;

  render() {
    console.log(this.totals);

    const additionsStr = this.totals.additions.toLocaleString();
    const changedFilesStr = this.totals.changedFiles.toLocaleString();
    const commitCountStr = this.totals.commitCount.toLocaleString();
    const deletionsStr = this.totals.deletions.toLocaleString();

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
          <Legend color="color-1" title="Additions" value={additionsStr} />
          <Legend color="color-2" title="Deletions" value={deletionsStr} />
          <Legend color="color-3" title="Changed Files" value={changedFilesStr} />
        </div>
      </Card>
    );
  }
}

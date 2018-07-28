import { Vue, Component, Prop } from 'vue-property-decorator';
import Bar from '@/components/Bar';
import Card from '@/components/Card';
import CountTo from '@/components/CountTo';
import Legend from '@/components/Legend';
import { Counts, DataPoint } from '@/types';

@Component
export default class extends Vue {
  @Prop() counts!: Counts;

  render() {
    const sections: DataPoint[] = [
      { color: 'color-1', title: 'Additions', value: this.counts.additions },
      { color: 'color-2', title: 'Deletions', value: this.counts.deletions },
      { color: 'color-3', title: 'Changed Files', value: this.counts.changedFiles },
    ];

    return (
      <Card title="Statistics" class="statistics">
        <h3>
          <CountTo endVal={this.counts.commitCount} />
          Commits
        </h3>
        <h4>
          In Total
        </h4>
        <hr />
        <Legend class="statistics__legend" sections={sections} />
        <Bar sections={sections} />
      </Card>
    );
  }
}

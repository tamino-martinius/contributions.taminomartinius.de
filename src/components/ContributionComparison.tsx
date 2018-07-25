// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { CommitSplit, DataPoint, Counts } from '@/types';

@Component
export default class extends Vue {
  @Prop() counts!: CommitSplit<Counts>;

  render() {
    const valueOpen = this.counts.open.commitCount / this.counts.sum.commitCount;
    const valueClosed = this.counts.closed.commitCount / this.counts.sum.commitCount;

    const sections: DataPoint[] = [
      { color: 'color-open', title: 'Open Source', value: `${(valueOpen * 100).toFixed(2)}%` },
      { color: 'color-closed', title: 'Private', value: `${(valueClosed * 100).toFixed(2)}%` },
    ];

    return (
      <Card title="Contribution Comparison" class="contribution-comparison">
        <Legend sections={sections} />
      </Card>
    );
  }
}

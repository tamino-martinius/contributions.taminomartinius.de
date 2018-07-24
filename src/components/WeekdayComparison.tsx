// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Card from '@/components/Card';
import { CommitSplit, Dict, WeekDayStats } from '@/types';
import Legend from '@/components/Legend';

@Component
export default class extends Vue {
  @Prop() weekdays!: CommitSplit<Dict<WeekDayStats>>;

  render() {

    const sections: DataPoint[] = [
      { color: 'color-open', title: 'Open Source', value: 'nothing' },
      { color: 'color-closed', title: 'Private', value: 'nothing' },
    ];

    return (
      <Card title="Weekday Comparison" class="weekday-comparison">

        <Legend class="weekday-comparison__legend" sections={sections} slot="footer" />
      </Card>
    );
  }
}

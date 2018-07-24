// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Card from '@/components/Card';
import { CommitSplit, Dict, WeekDayStats } from '@/types';

@Component
export default class extends Vue {
  @Prop() weekdays!: CommitSplit<Dict<WeekDayStats>>;

  render() {

    return (
      <Card title="Weekday Comparison" class="weekday-comparison">

      </Card>
    );
  }
}

// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import WeekDay from './WeekDay';
import {
  Dict,
  WeekDayStats,
} from '../types';

@Component
export default class extends Vue {
  @Prop() stats!: Dict<WeekDayStats>;

  getMaxHourValue(): number {
    let max = 0;
    for (const weekDayName in this.stats) {
      const weekDay = this.stats[weekDayName];
      for (const hourName in weekDay.hours) {
        const hour = weekDay.hours[hourName];
        if (max < hour.commitCount) max = hour.commitCount;
      }
    }
    return max;
  }

  render() {
    const days = [];
    for (let weekDayNumber = 0; weekDayNumber < 7; weekDayNumber += 1) {
      days.push(<WeekDay stats={this.stats[weekDayNumber.toString()]} />);
    }
    return (
      <div
        class="weekdays"
        style={`--max-value=${this.getMaxHourValue()}`}
      >
        {days}
      </div>
    );
  }
}

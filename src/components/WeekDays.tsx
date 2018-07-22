// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import WeekDay from '@/components/WeekDay';
import {
  Dict,
  WeekDayStats,
} from '@/types';

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

  getMaxDayValue(): number {
    let max = 0;
    for (const weekDayName in this.stats) {
      const weekDay = this.stats[weekDayName];
      if (max < weekDay.commitCount) max = weekDay.commitCount;
    }
    return max;
  }

  render() {
    const days = [];
    for (let weekDayNumber = 0; weekDayNumber < 7; weekDayNumber += 1) {
      days.push(<WeekDay stats={this.stats[weekDayNumber.toString()]} index={weekDayNumber} />);
    }
    const hoursHeaders = [];
    for (let hourNumber = 0; hourNumber < 24; hourNumber += 1) {
      hoursHeaders.push(<div>{hourNumber}</div>);
    }
    return (
      <div
        class="weekdays"
        style={{
          '--max-hour-value': this.getMaxHourValue(),
          '--max-day-value': this.getMaxDayValue(),
        }}
      >
        {days}
        <div class="weekday weekday__header">
          <div class="weekday__day-of-week">
            &nbsp;
          </div>
          <div class="weekday__sum">
            Sum
          </div>
          <div class="weekday__hours">
            {hoursHeaders}
          </div>
        </div>
      </div>
    );
  }
}

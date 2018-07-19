// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import {
  WeekDayStats,
} from '../types';
import Total from './Total';

@Component
export default class extends Vue {
  @Prop() stats!: WeekDayStats;
  @Prop() index!: number;

  render() {
    const weekdays = [
      'Su',
      'Mo',
      'Tu',
      'We',
      'Th',
      'Fr',
      'Sa',
    ];
    const hours = [];
    for (let hourNumber = 0; hourNumber < 24; hourNumber += 1) {
      const hourStr = hourNumber.toString();
      const gridColumn = hourNumber + 1;
      const total = (
        <Total stats={this.stats.hours[hourStr]} style={{ gridColumn }} />
      );
      hours.push(total, total, total);
    }
    return (
      <div class="weekday">
        <div class="weekday__day-of-week">
          {weekdays[this.index]}
        </div>
        <div class="weekday__sum">
          <Total stats={this.stats} />
          <Total stats={this.stats} />
          <Total stats={this.stats} />
        </div>
        <div class="weekday__hours">
          {hours}
        </div>
      </div>
    );
  }
}

// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import {
  WeekDayStats,
} from '../types';
import Total from './Total';

@Component
export default class extends Vue {
  @Prop() stats!: WeekDayStats;

  render() {
    const hours = [];
    for (let hourNumber = 0; hourNumber < 24; hourNumber += 1) {
      hours.push(<Total stats={this.stats.hours[hourNumber.toString()]} />);
    }
    return (
      <div class="weekday">
        <div class="weekday__sum">
          <Total stats={this.stats} />
        </div>
        <div class="weekday__hours">
          {hours}
        </div>
      </div>
    );
  }
}

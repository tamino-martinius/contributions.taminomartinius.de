// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import {
  WeekDayStats,
} from '../types';

@Component
export default class extends Vue {
  @Prop() stats!: WeekDayStats;

  render() {
    return (
      <div>
        {console.log(this.stats)}
        Hello World
      </div>
    );
  }
}

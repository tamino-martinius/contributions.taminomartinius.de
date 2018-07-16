// This is an alternative way to define components using decorators
import { Vue, Component } from 'vue-property-decorator';
import Data from '../models/Data';
import WeekDays from '../components/WeekDays';
import {
  Dict,
  TimeStats,
} from '../types';

const data = new Data();

@Component
export default class extends Vue {
  stats: TimeStats | false = false;
  repoStats: Dict<TimeStats> | false = false;

  created() {
    data.getStats().then(stats => this.stats = stats);
    data.getRepoStats().then(stats => this.repoStats = stats);
  }

  // data() {
  //   return {
  //     stats: undefined,
  //     repoStats: undefined,
  //   };
  // }

  render() {
    return (
      <div>
        {this.stats ? (
          <WeekDays stats={this.stats.weekDays} />
        ) : (
          <div>has no stats</div>
        )}
      </div>
    );
  }
}

// This is an alternative way to define components using decorators
import { Vue, Component } from 'vue-property-decorator';
import Data from '@/models/Data';
import WeekDays from '@/components/WeekDays';
import Header from '@/components/Header';
import AboutMe from '@/components/AboutMe';
import Row, { RowType } from '@/components/Row';
import {
  Dict,
  TimeStats,
} from '@/types';
import '../style/index.scss';

const data = new Data();

@Component
export default class extends Vue {
  stats: TimeStats | false = false;
  repoStats: Dict<TimeStats> | false = false;

  created() {
    data.getStats().then(stats => this.stats = stats);
    data.getRepoStats().then(stats => this.repoStats = stats);
  }

  render() {
    return (
      <div class="app">
        <Header />
        <Row type={RowType.FIRST_THIRD}>
          <AboutMe slot="first" />
          <div class="card" slot="last">
            About us
          </div>
        </Row>
        <Row type={RowType.LAST_THIRD}>
          <AboutMe slot="first" />
          <div class="card" slot="last">
            About us
          </div>
        </Row>
        <Row type={RowType.FULL}>
          <AboutMe slot="first" />
        </Row>
        {/* {this.stats ? (
          <WeekDays stats={this.stats.weekDays} />
        ) : (
            <div>has no stats</div>
          )} */}

      </div>
    );
  }
}

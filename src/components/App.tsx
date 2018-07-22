// This is an alternative way to define components using decorators
import { Vue, Component } from 'vue-property-decorator';
import Data from '@/models/Data';
import WeekDays from '@/components/WeekDays';
import Header from '@/components/Header';
import AboutMe from '@/components/AboutMe';
import Statistics from '@/components/Statistics';
import Row, { RowType } from '@/components/Row';
import {
  Dict,
  TimeStats,
  Totals,
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

  totals() {
    const totals: Totals = {
      additions: 0,
      changedFiles: 0,
      commitCount: 0,
      deletions: 0,
    };
    if (this.stats) {
      for (const yearName in this.stats.yearly) {
        const yearlyTotals = this.stats.yearly[yearName];
        totals.additions += yearlyTotals.additions;
        totals.changedFiles += yearlyTotals.changedFiles;
        totals.commitCount += yearlyTotals.commitCount;
        totals.deletions += yearlyTotals.deletions;
      }
    }
    return totals;
  }

  render() {
    const page = (
      <div>
        <Row type={RowType.FIRST_THIRD}>
          <AboutMe slot="first" />
          <Statistics slot="last" totals={this.totals()} />
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
      </div>
    );
    const loading = (
      <div>
        loading ...
      </div>
    );
    return (
      <div class="app">
        <Header />
        {this.stats ? page : loading}
      </div>
    );
  }
}

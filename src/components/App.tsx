// This is an alternative way to define components using decorators
import { Vue, Component } from 'vue-property-decorator';
import Data from '@/models/Data';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Daytime from '@/components/Daytime';
import DaytimeComparison from '@/components/DaytimeComparison';
import Chart, { ChartType } from '@/components/Chart';
import AboutMe from '@/components/AboutMe';
import Statistics from '@/components/Statistics';
import ContributionComparison from '@/components/ContributionComparison';
import WeekdayComparison from '@/components/WeekdayComparison';
import YearlyStatistics from '@/components/YearlyStatistics';
import Row, { RowType } from '@/components/Row';
import { StatsData } from '@/types';
import '../style/index.scss';

const data = new Data();

@Component
export default class extends Vue {
  stats: StatsData | false = false;

  created() {
    data.getStats().then(stats => this.stats = stats);
  }

  render() {
    if (this.stats) {
      console.log(this.stats);

      return (
        <div class="app">
          <Header />
          <Row type={RowType.FIRST_THIRD}>
            <AboutMe slot="first" languages={this.stats.languages} counts={this.stats.total.sum} />
            <Statistics slot="last" counts={this.stats.total.sum} />
          </Row>
          <Row>
            <Daytime weekDays={this.stats.weekDays.sum} />
          </Row>
          <Row>
            <DaytimeComparison weekDays={this.stats.weekDays} />
          </Row>
          <Row type={RowType.LAST_THIRD}>
            <WeekdayComparison
              slot="first"
              weekdays={this.stats.weekDays}
            />
            <ContributionComparison
              slot="last"
              counts={this.stats.total}
            />
          </Row>
          <Row>
            <Chart
              class="years"
              title="Years"
              graphs={[]}
            />
          </Row>
          <Row>
            <YearlyStatistics
              dates={this.stats.dates.sum}
              repos={this.stats.repositories}
            />
          </Row>
          <Row>
            <Chart
              class="timeline"
              title="Timeline"
              graphs={[]}
            />
          </Row>
          <Footer />
        </div>
      );
    }
    return (
      <div class="app">
        <Header />
        <div>
          loading ...
        </div>
        <Footer />
      </div>
    );
  }
}

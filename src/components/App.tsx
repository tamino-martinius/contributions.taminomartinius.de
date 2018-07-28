import { Vue, Component } from 'vue-property-decorator';
import Data from '@/models/Data';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import Header from '@/components/Header';
import Daytime from '@/components/Daytime';
import DaytimeComparison from '@/components/DaytimeComparison';
import AboutMe from '@/components/AboutMe';
import Statistics from '@/components/Statistics';
import ContributionComparison from '@/components/ContributionComparison';
import Timeline from '@/components/Timeline';
import WeekdayComparison from '@/components/WeekdayComparison';
import YearlyStatistics from '@/components/YearlyStatistics';
import Years from '@/components/Years';
import Row, { RowType } from '@/components/Row';
import { StatsData } from '@/types';
import '../style/index.scss';

const data = new Data();
const MIN_SCREEN_SIZE = 920;

@Component
export default class extends Vue {
  stats: StatsData | false = false;

  created() {
    data.getStats().then(stats => this.stats = stats);
  }

  setViewport() {
    const metaViewport = document.getElementById('vp');
    console.log(metaViewport);

    if (metaViewport) {
      if (screen.width < MIN_SCREEN_SIZE) {
        metaViewport.setAttribute('content', `user-scalable=no, width=${MIN_SCREEN_SIZE}`);
      } else {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    }
  }

  mounted() {
    this.setViewport();
    window.addEventListener('resize', this.setViewport);
  }

  destroyed() {
    window.removeEventListener('resize', this.setViewport);
  }

  render() {
    let content: JSX.Element | undefined = undefined;

    if (this.stats) {
      content = (
        <div class="app__content">
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
            <WeekdayComparison slot="first" weekdays={this.stats.weekDays} />
            <ContributionComparison slot="last" counts={this.stats.total} />
          </Row>
          <Row>
            <Years dates={this.stats.dates.sum} />
          </Row>
          <Row>
            <YearlyStatistics dates={this.stats.dates.sum} repos={this.stats.repositories} />
          </Row>
          <Row>
            <Timeline dates={this.stats.dates} />
          </Row>
          <Footer />
        </div>
      );
    }
    return (
      <div class={['app', this.stats ? 'app--loaded' : '']}>
        {content}
        <Loading hidden={!!this.stats} />
      </div>
    );
  }
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Footer } from '@/components/Layout/Footer';
import { Header, type MetricsTab } from '@/components/Layout/Header';
import { Loading } from '@/components/Loading/Loading';
import { Row, RowType } from '@/components/shared/Row';
import { MetricsApiError } from '@/live/metricsApi';
import Data from '@/models/Data';
import { LiveData } from '@/models/LiveData';
import type { MetricsData } from '@/models/MetricsData';
import '@/style/index.css';
import './App.css';

// GitHub cards
import { GithubContributionTotalsCard } from './Card/github/GithubContributionTotalsCard/GithubContributionTotalsCard';
import { GithubDaytimeChartCard } from './Card/github/GithubDaytimeChartCard/GithubDaytimeChartCard';
import { GithubFollowersCard } from './Card/github/GithubFollowersCard/GithubFollowersCard';
import { GithubPopularReposCard } from './Card/github/GithubPopularReposCard/GithubPopularReposCard';
import { GithubTimelineCard } from './Card/github/GithubTimelineCard/GithubTimelineCard';
import { GithubTotalCountsCard } from './Card/github/GithubTotalCountsCard/GithubTotalCountsCard';
import { GithubUserCard } from './Card/github/GithubUserCard/GithubUserCard';
import { GithubVisibilityComparisionCard } from './Card/github/GithubVisibilityComparisionCard/GithubVisibilityComparisionCard';
import { GithubWeekdayChartCard } from './Card/github/GithubWeekdayChartCard/GithubWeekdayChartCard';
import { GithubWeekdayComparisonCard } from './Card/github/GithubWeekdayComparisonCard/GithubWeekdayComparisonCard';
import { GithubYearChartCard } from './Card/github/GithubYearChartCard/GithubYearChartCard';
import { GithubYearHeatmapCard } from './Card/github/GithubYearHeatmapCard/GithubYearHeatmapCard';
import { NpmOrganizationsCard } from './Card/npm/NpmOrganizationsCard/NpmOrganizationsCard';
// npm cards
import { NpmOrgDetailCard } from './Card/npm/NpmOrgDetailCard/NpmOrgDetailCard';
import { NpmOrgTimelineCard } from './Card/npm/NpmOrgTimelineCard/NpmOrgTimelineCard';
import { NpmPublishDaytimeCard } from './Card/npm/NpmPublishDaytimeCard/NpmPublishDaytimeCard';
import { NpmTotalCountsCard } from './Card/npm/NpmTotalCountsCard/NpmTotalCountsCard';
import { NpmUserCard } from './Card/npm/NpmUserCard/NpmUserCard';
import { NpmVersionHeatmapCard } from './Card/npm/NpmVersionHeatmapCard/NpmVersionHeatmapCard';

const MIN_SCREEN_SIZE = 920;

const DATA_AS_OF_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

interface AppProps {
  style?: React.CSSProperties;
  liveUser?: string;
}

const syncViewport = () => {
  function setViewport() {
    const metaViewport = document.getElementById('vp');
    if (metaViewport) {
      if (screen.width < MIN_SCREEN_SIZE) {
        metaViewport.setAttribute('content', `user-scalable=no, width=${MIN_SCREEN_SIZE}`);
      } else {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    }
  }

  setViewport();
  window.addEventListener('resize', setViewport);
  return () => window.removeEventListener('resize', setViewport);
};

export default function App({ style, liveUser }: AppProps) {
  const dataRef = useRef<MetricsData | null>(null);
  if (dataRef.current === null) {
    dataRef.current = liveUser ? new LiveData(liveUser) : new Data();
  }
  const data = dataRef.current;
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<'not-found' | 'unavailable' | null>(null);
  const [activeTab, setActiveTab] = useState<MetricsTab>('github');

  useEffect(() => {
    data
      .fetchData()
      .then(() => setIsLoading(false))
      .catch((error: unknown) => {
        setLoadError(error instanceof MetricsApiError && error.kind === 'not-found' ? 'not-found' : 'unavailable');
        setIsLoading(false);
      });
  }, [data]);

  useEffect(() => {
    if (liveUser) document.title = `Metrics · ${liveUser}`;
  }, [liveUser]);

  useEffect(syncViewport, []);

  const githubContent = useMemo(() => {
    if (isLoading) return null;
    if (liveUser) {
      return (
        <>
          <Row
            type={RowType.FIRST_THIRD}
            first={<GithubUserCard data={data} />}
            last={<GithubContributionTotalsCard data={data} />}
          />
          <Row>
            <GithubYearChartCard data={data} />
          </Row>
          <Row>
            <GithubYearHeatmapCard data={data} countLabel="Contributions" />
          </Row>
          <Row
            type={RowType.LAST_THIRD}
            first={<GithubWeekdayComparisonCard data={data} legendLabel="Contributions" />}
            last={<GithubFollowersCard data={data} />}
          />
          <Row>
            <GithubPopularReposCard data={data} />
          </Row>
        </>
      );
    }
    return (
      <>
        <Row
          type={RowType.FIRST_THIRD}
          first={<GithubUserCard data={data} />}
          last={<GithubTotalCountsCard data={data} />}
        />
        <Row>
          <GithubDaytimeChartCard data={data} />
        </Row>
        <Row>
          <GithubWeekdayChartCard data={data} />
        </Row>
        <Row
          type={RowType.LAST_THIRD}
          first={<GithubWeekdayComparisonCard data={data} />}
          last={<GithubVisibilityComparisionCard data={data} />}
        />
        <Row>
          <GithubYearChartCard data={data} />
        </Row>
        <Row>
          <GithubYearHeatmapCard data={data} />
        </Row>
        <Row
          type={RowType.LAST_THIRD}
          first={<GithubPopularReposCard data={data} />}
          last={<GithubFollowersCard data={data} />}
        />
        <Row>
          <GithubTimelineCard data={data} />
        </Row>
      </>
    );
  }, [isLoading, liveUser, data]);

  const npmContent = useMemo(() => {
    if (isLoading) return null;
    return (
      <>
        <Row type={RowType.FIRST_THIRD} first={<NpmUserCard data={data} />} last={<NpmTotalCountsCard data={data} />} />
        <Row>
          <NpmPublishDaytimeCard data={data} />
        </Row>
        <Row>
          <NpmOrgDetailCard data={data} />
        </Row>
        <Row>
          <NpmOrgTimelineCard data={data} />
        </Row>
        <Row>
          <NpmVersionHeatmapCard data={data} />
        </Row>
        <Row>
          <NpmOrganizationsCard data={data} />
        </Row>
      </>
    );
  }, [isLoading, data]);

  const dataAsOf = useMemo(() => {
    if (isLoading) return undefined;
    const date = data.latestDataDate;
    return date ? DATA_AS_OF_FORMATTER.format(date) : undefined;
  }, [isLoading, data]);

  const showNpmTab = !isLoading && !loadError ? data.hasNpmData : true;
  const effectiveTab = showNpmTab ? activeTab : 'github';

  const content = isLoading ? null : loadError ? (
    <div className="app__error">
      <h2>
        {loadError === 'not-found'
          ? `GitHub user "${liveUser}" was not found`
          : 'Live data is currently unavailable — please try again later'}
      </h2>
      <p>
        <a href="/">Back to metrics.tamino.dev</a>
      </p>
    </div>
  ) : (
    <div className="app__content">
      <Header
        activeTab={effectiveTab}
        onTabChange={setActiveTab}
        dataAsOf={dataAsOf}
        showNpmTab={showNpmTab}
        liveUser={liveUser}
      />
      {effectiveTab === 'github' ? githubContent : npmContent}
      <Footer />
    </div>
  );

  return (
    <div className={['app', !isLoading ? 'app--loaded' : ''].filter(Boolean).join(' ')} style={style}>
      {content}
      <Loading hidden={!isLoading} />
    </div>
  );
}

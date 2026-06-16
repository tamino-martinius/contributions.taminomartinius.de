import { useEffect, useMemo, useRef, useState } from 'react';
import { Footer } from '@/components/Layout/Footer';
import { Header, type MetricsTab } from '@/components/Layout/Header';
import { Loading } from '@/components/Loading/Loading';
import { Row, RowType } from '@/components/shared/Row';
import Data from '@/models/Data';
import '@/style/index.css';
import './App.css';

// GitHub cards
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

export default function App({ style }: AppProps) {
  const dataRef = useRef(new Data());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MetricsTab>('github');

  useEffect(() => {
    dataRef.current.fetchData().then(() => setIsLoading(false));
  }, []);

  useEffect(syncViewport, []);

  const githubContent = useMemo(() => {
    if (isLoading) return null;
    return (
      <>
        <Row
          type={RowType.FIRST_THIRD}
          first={<GithubUserCard data={dataRef.current} />}
          last={<GithubTotalCountsCard data={dataRef.current} />}
        />
        <Row>
          <GithubDaytimeChartCard data={dataRef.current} />
        </Row>
        <Row>
          <GithubWeekdayChartCard data={dataRef.current} />
        </Row>
        <Row
          type={RowType.LAST_THIRD}
          first={<GithubWeekdayComparisonCard data={dataRef.current} />}
          last={<GithubVisibilityComparisionCard data={dataRef.current} />}
        />
        <Row>
          <GithubYearChartCard data={dataRef.current} />
        </Row>
        <Row>
          <GithubYearHeatmapCard data={dataRef.current} />
        </Row>
        <Row
          type={RowType.LAST_THIRD}
          first={<GithubPopularReposCard data={dataRef.current} />}
          last={<GithubFollowersCard data={dataRef.current} />}
        />
        <Row>
          <GithubTimelineCard data={dataRef.current} />
        </Row>
      </>
    );
  }, [isLoading]);

  const npmContent = useMemo(() => {
    if (isLoading) return null;
    return (
      <>
        <Row
          type={RowType.FIRST_THIRD}
          first={<NpmUserCard data={dataRef.current} />}
          last={<NpmTotalCountsCard data={dataRef.current} />}
        />
        <Row>
          <NpmPublishDaytimeCard data={dataRef.current} />
        </Row>
        <Row>
          <NpmOrgDetailCard data={dataRef.current} />
        </Row>
        <Row>
          <NpmOrgTimelineCard data={dataRef.current} />
        </Row>
        <Row>
          <NpmVersionHeatmapCard data={dataRef.current} />
        </Row>
        <Row>
          <NpmOrganizationsCard data={dataRef.current} />
        </Row>
      </>
    );
  }, [isLoading]);

  const dataAsOf = useMemo(() => {
    if (isLoading) return undefined;
    const date = dataRef.current.latestDataDate;
    return date ? DATA_AS_OF_FORMATTER.format(date) : undefined;
  }, [isLoading]);

  const content = isLoading ? null : (
    <div className="app__content">
      <Header activeTab={activeTab} onTabChange={setActiveTab} dataAsOf={dataAsOf} />
      {activeTab === 'github' ? githubContent : npmContent}
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

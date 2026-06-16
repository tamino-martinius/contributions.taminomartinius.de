import { type FC, memo, useEffect, useRef, useState } from 'react';
import './Header.css';

export type MetricsTab = 'github' | 'npm';

interface HeaderProps {
  activeTab: MetricsTab;
  onTabChange: (tab: MetricsTab) => void;
  dataAsOf?: string;
}

export const Header: FC<HeaderProps> = memo(({ activeTab, onTabChange, dataAsOf }) => {
  const tabsRef = useRef<HTMLElement>(null);
  const githubRef = useRef<HTMLButtonElement>(null);
  const npmRef = useRef<HTMLButtonElement>(null);
  const [barStyle, setBarStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const activeRef = activeTab === 'github' ? githubRef : npmRef;
    const btn = activeRef.current;
    const nav = tabsRef.current;
    if (!btn || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setBarStyle({
      width: `${btnRect.width}px`,
      transform: `translateX(${btnRect.left - navRect.left}px)`,
    });
  }, [activeTab]);

  return (
    <header className="header">
      <div className="header__content">
        <h1>Metrics</h1>
        <div className="header__right">
          {dataAsOf ? <span className="header__updated">Updated {dataAsOf}</span> : null}
          <nav className="header__tabs" ref={tabsRef}>
            <button
              type="button"
              ref={githubRef}
              className={`header__tab${activeTab === 'github' ? ' header__tab--active' : ''}`}
              onClick={() => onTabChange('github')}
            >
              GitHub
            </button>
            <button
              type="button"
              ref={npmRef}
              className={`header__tab${activeTab === 'npm' ? ' header__tab--active' : ''}`}
              onClick={() => onTabChange('npm')}
            >
              npm
            </button>
            <div className="header__bar" style={barStyle} />
          </nav>
        </div>
      </div>
    </header>
  );
});

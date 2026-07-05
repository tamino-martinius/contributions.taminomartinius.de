import { createRoot } from 'react-dom/client';
import App from '@/components/App';
import { parseLiveUser } from '@/util/route';

const liveUser = parseLiveUser(window.location.pathname) ?? undefined;

function Main() {
  return <App liveUser={liveUser} />;
}

createRoot(document.getElementById('app')!).render(<Main />);

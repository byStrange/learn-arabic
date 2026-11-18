import { useEffect, useRef, type ReactNode } from 'react';
import { BookOpen, ChartNoAxesColumn, Route as RouteIcon, Sun } from 'lucide-react';
import { WordSheetProvider } from './components/WordSheet';
import { navigate, useRoute, type Route } from './lib/router';
import { Lesson } from './screens/Lesson';
import { Onboarding } from './screens/Onboarding';
import { Path } from './screens/Path';
import { Progress } from './screens/Progress';
import { Read } from './screens/Read';
import { Session } from './screens/Session';
import { Today } from './screens/Today';
import { AppProvider, useApp } from './state/AppState';

export default function App() {
  return (
    <AppProvider>
      <WordSheetProvider>
        <Shell />
      </WordSheetProvider>
    </AppProvider>
  );
}

function Shell() {
  const { route, hash } = useRoute();
  const { state } = useApp();
  const onboarded = state.settings.onboarded;

  useEffect(() => {
    if (!onboarded && route.name !== 'onboarding') navigate('/onboarding');
  }, [onboarded, route.name]);

  if (!onboarded) {
    return (
      <Layout route={{ name: 'onboarding' }} hideNav>
        <Onboarding />
      </Layout>
    );
  }
  if (route.name === 'session') return <Session key={hash} route={route} />;
  return (
    <Layout route={route}>
      {route.name === 'today' && <Today />}
      {route.name === 'onboarding' && <Onboarding />}
      {route.name === 'path' && <Path />}
      {route.name === 'lesson' && <Lesson id={route.id} />}
      {route.name === 'read' && <Read surah={route.surah} />}
      {route.name === 'progress' && <Progress />}
    </Layout>
  );
}

const NAV = [
  { id: 'today', href: '#/today', label: 'Today', Icon: Sun },
  { id: 'path', href: '#/path', label: 'Path', Icon: RouteIcon },
  { id: 'read', href: '#/read', label: 'Read', Icon: BookOpen },
  { id: 'progress', href: '#/progress', label: 'Progress', Icon: ChartNoAxesColumn },
] as const;

function activeNav(route: Route): string {
  if (route.name === 'lesson') return 'path';
  return route.name;
}

function Layout({ route, children, hideNav }: { route: Route; children: ReactNode; hideNav?: boolean }) {
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  const key = route.name + ('id' in route ? route.id : '') + ('surah' in route ? route.surah : '');

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [key]);

  const current = activeNav(route);
  return (
    <div className={`shell ${hideNav ? 'shell--bare' : ''}`}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); main.current?.focus(); }}>
        Skip to content
      </a>
      <header className="shell__header">
        <p className="wordmark">
          <span>Qalam</span> <span className="ar wordmark__ar" lang="ar" dir="rtl">قلم</span>
        </p>
      </header>
      {!hideNav && (
        <nav className="nav" aria-label="Main">
          <ul>
            {NAV.map(({ id, href, label, Icon }) => (
              <li key={id}>
                <a href={href} aria-current={current === id ? 'page' : undefined} className="nav__link">
                  <Icon aria-hidden="true" size={22} />
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <main id="main" ref={main} tabIndex={-1} className="shell__main">
        {children}
      </main>
      <footer className="shell__footer">
        <p>Quran text and translations: Quran.com API (Saheeh International; Muhammad Sodiq Muhammad Yusuf).</p>
      </footer>
    </div>
  );
}

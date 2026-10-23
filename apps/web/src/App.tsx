import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Me, Schema } from './api/contract';
import { config, telegram, useTelegram } from './platform/telegram';
import { useRead, useWrite } from './hooks/useApi';
import { useNavigation } from './hooks/useNavigation';
import { Feedback } from './components/Feedback';
import { StartScreen } from './start/StartScreen';
import { HomeScreen } from './tasks/HomeScreen';
import { TaskNewScreen } from './tasks/TaskNewScreen';
import { TaskScreen } from './tasks/TaskScreen';
import { HistoryScreen } from './history/HistoryScreen';
import { BattleScreen } from './battle/BattleScreen';
import { ShopContent } from './shop/ShopContent';
import { ShareScreen } from './sharing/ShareScreen';
import { SettingsScreen } from './settings/SettingsScreen';
import { LeaderboardScreen } from './leaderboard/LeaderboardScreen';
import { OwnerScreen } from './owner/OwnerScreen';
import { MoreScreen } from './MoreScreen';
import './styles/app.css';

const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 15000 }, mutations: { retry: false } } });

function TimeZonePrompt({ me }: { me: Me }) {
  const [dismissed, setDismissed] = useState(false);
  const update = useWrite(me.id, 'updateMe');
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (dismissed || !zone || zone === me.timeZone) {
    return null;
  }
  return (
    <aside className="card stack">
      <h2>Обновить часовой пояс?</h2>
      <p>{`Сохранён ${me.timeZone}, устройство сейчас в ${zone}. По поясу считаются сроки, проверки и тихие часы.`}</p>
      <Feedback error={update.error} />
      <button className="btn ghost" disabled={update.isPending} onClick={() => void update.run({ body: { timeZone: zone } }).then(response => response && setDismissed(true)).catch(() => {})}>
        {`Обновить на ${zone}`}
      </button>
      <button className="btn ghost" onClick={() => setDismissed(true)}>{`Оставить ${me.timeZone}`}</button>
    </aside>
  );
}

const tabs = [['home', 'Главная'], ['battle', 'Бой'], ['history', 'История'], ['leaderboard', 'Рейтинг'], ['more', 'Ещё']];

function Session({ me, deleted }: { me: Me; deleted: () => void }) {
  const { route, go } = useNavigation();
  const [starting, setStarting] = useState(me.onboarding === 'guest');
  const [firstTask, setFirstTask] = useState(false);
  const [sharing, setSharing] = useState<Schema<'CreateShareRequest'>>();
  const back = useCallback(() => {
    if (sharing) {
      setSharing(undefined);
    } else {
      go(route.startsWith('task/') || route === 'task-new' ? 'home' : 'more');
    }
  }, [sharing, go, route]);
  useTelegram(!sharing && (starting || route === 'home') ? undefined : back);
  if (starting || me.onboarding === 'guest') {
    return (
      <main className="page">
        <StartScreen
          me={me}
          finished={() => {
            setStarting(false);
            setFirstTask(true);
            go('task-new');
          }}
        />
      </main>
    );
  }
  const current = route.startsWith('task') ? 'home' : ['shop', 'settings', 'owner'].includes(route) ? 'more' : route;
  let screen;
  if (route === 'task-new') {
    screen = (
      <TaskNewScreen
        me={me}
        go={(next) => {
          setFirstTask(false);
          go(next);
        }}
      />
    );
  } else if (route.startsWith('task/')) {
    screen = <TaskScreen key={route} id={decodeURIComponent(route.slice(5))} me={me} go={go} share={setSharing} />;
  } else if (route === 'battle') {
    screen = <BattleScreen key={me.role} me={me} share={setSharing} />;
  } else if (route === 'history') {
    screen = <HistoryScreen me={me} go={go} />;
  } else if (route === 'leaderboard') {
    screen = <LeaderboardScreen me={me} />;
  } else if (route === 'shop') {
    screen = (
      <>
        <a className="back" href="#more">← Ещё</a>
        <h1 tabIndex={-1}>Удары</h1>
        <ShopContent me={me} />
      </>
    );
  } else if (route === 'settings') {
    screen = <SettingsScreen me={me} deleted={deleted} />;
  } else if (route === 'owner') {
    screen = <OwnerScreen me={me} />;
  } else if (route === 'more') {
    screen = <MoreScreen me={me} />;
  } else {
    screen = <HomeScreen me={me} />;
  }
  return (
    <>
      <main className="page">
        {config.mocks && <p className="small muted" role="status">Демонстрация · MSW · данные сбрасываются при перезагрузке</p>}
        <div className="screen-stack" hidden={!!sharing}>
          <TimeZonePrompt me={me} />
          {screen}
        </div>
        {sharing && <ShareScreen me={me} body={sharing} back={() => setSharing(undefined)} />}
      </main>
      {!firstTask && !sharing && (
        <nav className="tabbar" aria-label="Основная навигация">
          {tabs.map(([value, label]) => <a href={`#${value}`} key={value} aria-current={current === value ? 'page' : undefined}>{label}</a>)}
        </nav>
      )}
    </>
  );
}

function AuthenticatedApp() {
  const [accountDeleted, setAccountDeleted] = useState(false);
  const enabled = config.mocks || !!telegram()?.initData;
  const profile = useRead('session', 'getMe', {}, enabled && !accountDeleted, true);
  const queryClient = useQueryClient();
  const { refetch } = profile;
  const launchData = useRef(telegram()?.initData);
  const previousUser = useRef<string | undefined>(undefined);
  useEffect(() => {
    const id = profile.data?.id;
    const previous = previousUser.current;
    if (previous && id && previous !== id) {
      void queryClient.cancelQueries({ queryKey: [previous] });
      queryClient.removeQueries({ queryKey: [previous] });
    }
    if (id) {
      previousUser.current = id;
    }
  }, [profile.data?.id, queryClient]);
  useEffect(() => {
    const app = telegram();
    const refresh = async () => {
      const currentLaunchData = app?.initData;
      if (launchData.current !== currentLaunchData) {
        launchData.current = currentLaunchData;
        await queryClient.cancelQueries();
        queryClient.clear();
        await refetch();
      } else {
        // Returning from Telegram UI is not a new session: preserve mounted drafts.
        await queryClient.invalidateQueries();
      }
    };
    const activated = () => void refresh();
    app?.onEvent('activated', activated);
    return () => app?.offEvent('activated', activated);
  }, [queryClient, refetch]);
  if (accountDeleted) {
    return (
      <main className="page">
        <h1 tabIndex={-1}>Аккаунт удалён</h1>
        <p>Задачи и бои удалены. Вернуться можно через /start в боте.</p>
      </main>
    );
  }
  if (!enabled) {
    return (
      <main className="page">
        <h1>Батя</h1>
        <p className="banner">Открой приложение через Telegram.</p>
        {config.botUsername
          ? <a className="btn" href={`https://t.me/${encodeURIComponent(config.botUsername)}`}>Открыть бота</a>
          : <p className="muted">Имя бота ещё не настроено владельцем.</p>}
      </main>
    );
  }
  if (profile.data) {
    return <Session key={profile.data.id} me={profile.data} deleted={() => setAccountDeleted(true)} />;
  }
  return (
    <main className="page">
      <h1>Батя</h1>
      <Feedback pending={profile.isPending} error={profile.error} />
      {profile.isError && <button className="btn ghost" onClick={() => void profile.refetch()}>Повторить</button>}
    </main>
  );
}

export function App() {
  return <QueryClientProvider client={client}><div className="app"><AuthenticatedApp /></div></QueryClientProvider>;
}

import React from 'react';
import cls from 'classnames';
import { Route, useHistory, useLocation, matchPath } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { CustomThemeProvider } from './CustomThemeProvider';
import { useLoading } from './components/Loading';
import { useMessage } from './components/Message';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import Home from './pages/Home';
import History from './pages/History';
import Calendar from './pages/Calendar';
import { makeStyles, Typography } from '@material-ui/core';
import { GlobalContext } from './contexts';
import { useBaseStyles } from './styles/base';
import usePlayer, { PlayerContext } from './hooks/usePlayer';
import useMount from './hooks/useMount';
import { register } from './serviceWorker';

const useStyles = makeStyles(() => ({
  bottom: {
    position: 'fixed',
    bottom: '0',
    left: '0',
  },
  bottomItem: {
    maxWidth: 'none',
  },
}));

type RouteConfig = {
  path: string;
  component: () => JSX.Element;
  meta: {
    title: string;
  };
};

const routeConfig = [
  {
    path: '/',
    component: Home,
    meta: {
      title: '播放',
    },
  },
  {
    path: '/history',
    component: History,
    meta: {
      title: '历史',
    },
  },
  {
    path: '/calendar',
    component: Calendar,
    meta: {
      title: '每日放送',
    },
  },
];

function Title() {
  const location = useLocation<any>();
  const matches: RouteConfig[] = [];
  for (const route of routeConfig) {
    if (
      matchPath(location.pathname, {
        path: route.path,
      })
    ) {
      matches.push(route);
    }
  }

  if (matches.length) {
    for (const match of matches.reverse()) {
      if (match.meta.title) {
        document.title = match.meta.title;
        break;
      }
    }
  }

  return null;
}

function MainApp() {
  const player = usePlayer();
  return (
    <PlayerContext.Provider value={player}>
      {routeConfig.map((item) => {
        return (
          <Route path={item.path} key={item.path}>
            {({ match }) => (
              <CSSTransition
                in={match != null}
                classNames="slide-up"
                timeout={{ enter: 250, exit: 200 }}
                mountOnEnter={true}
                unmountOnExit={true}
              >
                <item.component />
              </CSSTransition>
            )}
          </Route>
        );
      })}
    </PlayerContext.Provider>
  );
}

function App() {
  const { showMessage, Message } = useMessage();
  const { withLoading, Loading, setLoading } = useLoading();
  const classes = useStyles({});
  const baseClasses = useBaseStyles({});
  const history = useHistory<any>();
  const location = useLocation<any>();
  useMount(
    {
      register,
    },
    ({ register }) => {
      register({
        onUpdate: () => {
          showMessage('检测到新版本，请彻底退出浏览器后重新启动！');
        },
      });
    },
  );
  return (
    <CustomThemeProvider>
      <Title />
      <GlobalContext.Provider value={{ showMessage, withLoading, setLoading }}>
        <MainApp />
      </GlobalContext.Provider>
      <BottomNavigation
        showLabels
        classes={{ root: cls(baseClasses.btn, classes.bottom, 'w-full') }}
      >
        {routeConfig.map((item, i) => {
          return (
            <BottomNavigationAction
              key={i}
              classes={{
                root: cls(
                  classes.bottomItem,
                  location.pathname === item.path ? baseClasses.container : '',
                ),
              }}
              label={<Typography variant="h6">{item.meta.title}</Typography>}
              onClick={() => history.replace(item.path)}
            ></BottomNavigationAction>
          );
        })}
      </BottomNavigation>
      <Message />
      <Loading />
    </CustomThemeProvider>
  );
}

export default App;

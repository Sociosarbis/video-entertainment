import React from 'react';
import cls from 'classnames';
import { Route, useHistory, useLocation } from 'react-router-dom';
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

function MainApp() {
  const player = usePlayer();
  return (
    <PlayerContext.Provider value={player}>
      <Route component={Home}></Route>
      <Route path="/history">
        {({ match }) => (
          <CSSTransition
            in={match != null}
            classNames="slide-up"
            timeout={{ enter: 250, exit: 200 }}
            mountOnEnter={true}
            unmountOnExit={true}
          >
            <History />
          </CSSTransition>
        )}
      </Route>
      <Route path="/calendar">
        {({ match }) => (
          <CSSTransition
            in={match != null}
            classNames="slide-up"
            timeout={{ enter: 250, exit: 200 }}
            mountOnEnter={true}
            unmountOnExit={true}
          >
            <Calendar />
          </CSSTransition>
        )}
      </Route>
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
  return (
    <CustomThemeProvider>
      <GlobalContext.Provider value={{ showMessage, withLoading, setLoading }}>
        <MainApp />
      </GlobalContext.Provider>
      <BottomNavigation
        showLabels
        classes={{ root: cls(baseClasses.btn, classes.bottom, 'w-full') }}
      >
        {[
          ['播放', '/'],
          ['历史', '/history'],
          ['每日放送', '/calendar'],
        ].map((item, i) => {
          return (
            <BottomNavigationAction
              key={i}
              classes={{
                root: cls(
                  classes.bottomItem,
                  location.pathname === item[1] ? baseClasses.container : '',
                ),
              }}
              label={<Typography variant="h6">{item[0]}</Typography>}
              onClick={() => history.replace(item[1])}
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

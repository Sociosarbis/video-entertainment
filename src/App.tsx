import React from 'react';
import cls from 'classnames';
import { Route, useHistory } from 'react-router-dom';
import { CustomThemeProvider } from './CustomThemeProvider';
import { useLoading } from './components/Loading';
import { useMessage } from './components/Message';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import Home from './pages/Home';
import History from './pages/History';
import { makeStyles } from '@material-ui/core';
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
      <Route path="/history" component={History}></Route>
    </PlayerContext.Provider>
  );
}

function App() {
  const { showMessage, Message } = useMessage();
  const { withLoading, Loading } = useLoading();
  const classes = useStyles({});
  const baseClasses = useBaseStyles({});
  const history = useHistory<any>();
  return (
    <CustomThemeProvider>
      <GlobalContext.Provider value={{ showMessage, withLoading }}>
        <MainApp />
      </GlobalContext.Provider>
      <BottomNavigation
        showLabels
        classes={{ root: cls(baseClasses.btn, classes.bottom, 'w-full') }}
      >
        {[
          ['播放', '/'],
          ['历史', '/history'],
        ].map((item, i) => {
          return (
            <BottomNavigationAction
              key={i}
              classes={{ root: classes.bottomItem }}
              label={item[0]}
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

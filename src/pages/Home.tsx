import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  SyntheticEvent,
  forwardRef,
  MutableRefObject,
  useReducer,
} from 'react';
import PlayList from '../components/PlayList';
import Video from '../components/Video';
import { useListDialog } from '../components/ListDialog';
import { WorkDetail } from '../components/WorkDetail';
import WorkItem from '../components/WorkItem';
import { FindWorksResponse, Work } from '../apis/work';
import { Grid, makeStyles } from '@material-ui/core';
import { GlobalContext, GlobalContextValue } from '../contexts';
import { PlayerContext, Player } from '../hooks/usePlayer';
import { useApolloClient } from 'react-apollo';
import { useLocation, useParams, useHistory } from 'react-router-dom';
import { gql } from 'apollo-boost';
import cls from 'classnames';
import { useBaseStyles } from '../styles/base';

const useStyles = makeStyles(() => ({
  page: {
    padding: '10px 10px 60px 10px',
  },
  padding: {
    paddingTop: '64px',
  },
  search: {
    position: 'absolute',
    padding: '10px',
    left: 0,
    top: 0,
    boxSizing: 'border-box',
    width: '100%',
  },
}));

type SearchRef = {
  setInputValue: (value: string) => any;
  inputValue: string;
  changeOffset: (change: number) => any;
};

const Search = forwardRef<
  SearchRef,
  {
    onConfirm: (value: string) => any;
    children: React.ReactNode;
    onChangeHeight: (height: number) => any;
  }
>(({ onConfirm, children, onChangeHeight }, ref) => {
  const classes = useStyles({});
  const baseClasses = useBaseStyles({});
  const rootRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<number>(0);
  useEffect(() => {
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const e of entries) {
        heightRef.current = (e.target as HTMLElement).offsetHeight;
        onChangeHeight(heightRef.current);
      }
    });
    if (rootRef.current) {
      observer.observe(rootRef.current);
      heightRef.current = rootRef.current.offsetHeight;
      onChangeHeight(heightRef.current);
    }
    return () => observer.disconnect();
  }, [rootRef, heightRef, onChangeHeight]);
  const [offset, changeOffset] = useReducer(
    (state: number, delta: number): number => {
      return Math.max(Math.min(0, state + delta), -74);
    },
    0,
  );
  const [inputValue, setInputValue] = useState('');
  (ref as MutableRefObject<SearchRef>).current = {
    setInputValue,
    inputValue,
    changeOffset,
  };
  return (
    <div
      ref={rootRef}
      className={cls([
        baseClasses.smallTransition,
        'bg-canvas',
        classes.search,
      ])}
      style={{
        transform: `perspective(1px) translate3d(0, ${offset}px, 0)`,
      }}
    >
      <input
        className="w-full mb-2 bg-black input"
        id="url-input"
        placeholder="影片名称"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
            onConfirm(inputValue);
          }
        }}
      />
      <div className="mb-2">
        <input
          id="replace-video-button"
          className="mr-1 btn"
          type="button"
          value="搜索影片"
          onClick={() => onConfirm(inputValue)}
        />
      </div>
      {children}
    </div>
  );
});

function Home() {
  const classes = useStyles({});
  const [workList, setWorkList] = useState<FindWorksResponse>([]);
  const player = useContext(PlayerContext) as Player;
  const isInited = useRef(false);
  const location = useLocation<any>();
  const history = useHistory();
  const params = useParams<{ work_id?: string; ep_id?: string }>();
  const searchRef = useRef<SearchRef>(null);
  const { setOpen, ListDialog } = useListDialog();
  const { showMessage, withLoading } = useContext(
    GlobalContext,
  ) as GlobalContextValue;
  const onSelectPlayList = useCallback(
    async (item: FindWorksResponse[0]) => {
      if (searchRef.current) {
        item.keywords = searchRef.current.inputValue;
      }
      await player.selectPlayList(item);
      setOpen(false);
    },
    [setOpen, player, searchRef],
  );

  useEffect(() => {
    (async function () {
      if (!isNaN(Number(params.work_id))) {
        await player.selectPlayList({
          id: Number(params.work_id),
        });
        if (player.work && params.ep_id) {
          if (Number(params.ep_id) < player.work.playList.length) {
            player.controller.current?.handlePlay(
              player.work.playList[Number(params.ep_id)].url,
            );
          }
        }
      }
      isInited.current = true;
    })();
  }, []);

  const pageUrl = useMemo(() => {
    let path = '/videos';
    if (player.work) {
      path += `/${player.work.id}`;
      if (~player.epIndex) {
        path += `/${player.epIndex}`;
      }
    }
    return path;
  }, [player.work, player.epIndex]);

  useEffect(() => {
    if (isInited.current) {
      if (
        location.pathname === '/' ||
        location.pathname.startsWith('/videos')
      ) {
        if (location.pathname !== pageUrl) {
          history.replace(pageUrl);
        }
        if (~player.epIndex) {
          document.title = `正在播放 ${player.work?.name} ${
            player.work?.playList[player.epIndex].name
          }`;
        }
      }
    }
  }, [pageUrl, location.pathname]);

  const client = useApolloClient();

  const onConfirmSearch = useCallback(
    async (value: string) => {
      if (!value.trim()) return showMessage('影片名称不可为空');
      const {
        data: { works: res },
      } = await withLoading(
        client.query<{ works: Work[] }>({
          query: gql`
            query FindWorks($keyword: String!) {
              works(keyword: $keyword) {
                name
                cate
                tag
                utime
                id
              }
            }
          `,
          variables: {
            keyword: value,
          },
        }),
      );
      setWorkList(res);
      setOpen(true);
    },
    [setOpen, setWorkList, client, withLoading, showMessage],
  );

  const [padding, setPadding] = useState(74);

  const scrollRef = useRef<number>(0);

  const onScroll = useCallback((e: SyntheticEvent) => {
    const scrollTop = (e.target as HTMLElement).scrollTop;
    const diff = scrollRef.current - scrollTop;
    if (searchRef.current) {
      searchRef.current.changeOffset(diff);
    }
    scrollRef.current = scrollTop;
  }, []);

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = new URLSearchParams(location.search).get('search');
    if (text) {
      if (searchRef.current) {
        searchRef.current.setInputValue(text);
      }
    }
  }, [location.search, searchRef]);

  return (
    <Grid
      container
      direction="column"
      classes={{
        root: classes.page,
      }}
      className="bottom-navigation-page"
    >
      <Grid
        item
        component="div"
        className={cls('overflow-auto', 'flex-1')}
        onScroll={onScroll}
        style={{ paddingTop: `${padding}px`, paddingBottom: '20px' }}
        ref={container}
      >
        {player.work ? (
          <>
            <WorkDetail
              poster={player.work.image}
              name={player.work.name}
              keywords={player.work.keywords}
            />
            <PlayList
              currentUrl={player.videoUrl}
              work={player.work}
              onSelect={(url) => player.controller.current?.handlePlay(url)}
            />
          </>
        ) : null}
      </Grid>
      <Search
        onConfirm={onConfirmSearch}
        ref={searchRef}
        onChangeHeight={setPadding}
      >
        <div className="text-center mb-2">
          <Video />
        </div>
      </Search>
      <ListDialog
        list={workList}
        title="搜索结果"
        renderItem={WorkItem}
        onItemClick={onSelectPlayList}
      />
    </Grid>
  );
}

export default Home;

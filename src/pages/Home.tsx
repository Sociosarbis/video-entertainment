import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useContext,
  SyntheticEvent,
  forwardRef,
  MutableRefObject,
} from 'react';
import Hls from 'hls.js';
import PlayList from '../components/PlayList';
import { useListDialog } from '../components/ListDialog';
import { WorkDetail } from '../components/WorkDetail';
import WorkItem from '../components/WorkItem';
import { FindWorksResponse, HistoryItem, Work } from '../apis/work';
import { Grid, makeStyles } from '@material-ui/core';
import { GlobalContext, GlobalContextValue } from '../contexts';
import { PlayerContext, Player } from '../hooks/usePlayer';
import { DBContext } from '../contexts/db';
import { omit } from '../utils/obj';
import { useApolloClient } from 'react-apollo';
import { useLocation } from 'react-router-dom';
import { gql } from 'apollo-boost';
import useSwipe from '../hooks/useSwipe';
import cls from 'classnames';
import { useBaseStyles } from '../styles/base';

const urlRegExp = /([a-zA-Z0-9]+:)?\/*?([^#?/:]+)(:\d+)?([^:#?]*?)(\?[^#]*)?(#.*)?$/;

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

type SearchRef = { setInputValue: (value: string) => any; inputValue: string };

const Search = forwardRef<
  SearchRef,
  {
    show: boolean;
    onConfirm: (value: string) => any;
  }
>(({ show, onConfirm }, ref) => {
  const classes = useStyles({});
  const baseClasses = useBaseStyles({});
  const [inputValue, setInputValue] = useState('');
  (ref as MutableRefObject<SearchRef>).current = {
    setInputValue,
    inputValue,
  };
  return (
    <div
      className={cls([
        show ? baseClasses.slideIn : baseClasses.slideDownOut,
        baseClasses.smallTransition,
        'bg-canvas',
        classes.search,
      ])}
    >
      <input
        className="w-full mb-2 bg-black input"
        id="url-input"
        placeholder="影片名称"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
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
    </div>
  );
});

function Home() {
  const classes = useStyles({});
  const [workList, setWorkList] = useState<FindWorksResponse>([]);
  const player = useContext(PlayerContext) as Player;
  const db = useContext(DBContext);
  const location = useLocation<any>();
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

  const client = useApolloClient();

  const hlsRef = useRef<Hls | null>(null);

  const playerRef = useRef<HTMLVideoElement | null>(null);

  const handlePlay = useCallback(
    (url: string) => {
      const playerEl = playerRef.current as HTMLVideoElement;
      const hls = hlsRef.current as Hls;
      const match = url.trim().match(urlRegExp);
      hls.detachMedia();
      if (match) {
        let url = match[0];
        if (match[1] === 'http:') {
          url = url.replace(/^http:/, 'https:');
        }
        player.setVideoUrl(url);
        if (player.work) {
          const chap = player.work.playList.find((item) => item.url === url);
          if (chap) {
            db.set<Omit<Work, 'playList'>>(
              'work',
              player.work.url,
              omit(player.work, ['playList']),
            ).then(() =>
              db.set<HistoryItem>('history', url, {
                url,
                utime: Math.floor(new Date().valueOf() / 1000),
                chap: chap.name,
                workUrl: (player.work as Work).url,
              }),
            );
          }
        }
        if (/\.m3u8/.test(url)) {
          hls.attachMedia(playerEl);
          hls.loadSource(url);
        } else {
          playerEl.setAttribute('src', url);
          playerEl.play();
        }
      }
    },
    [player, db],
  );

  player.controller.current = {
    handlePlay,
  };

  useEffect(() => {
    const hls = new Hls();
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      (playerRef.current as HTMLVideoElement).play();
    });
    hlsRef.current = hls;
  }, []);

  const { onTouchStart, onTouchEnd, onSwipe } = useSwipe();

  const [hideSearch, setHideSearch] = useState(false);

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
                url
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

  const onScroll = useCallback(
    (e: SyntheticEvent) => {
      if ((e.target as HTMLElement).scrollTop <= 64) {
        setHideSearch(false);
      }
    },
    [setHideSearch],
  );

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = new URLSearchParams(location.search).get('search');
    if (text) {
      if (searchRef.current) {
        searchRef.current.setInputValue(text);
      }
      setHideSearch(false);
    }
  }, [location.search, searchRef]);

  onSwipe.current = useCallback((data) => {
    if (data && container.current) {
      if (data.y < -200) {
        if (container.current.scrollTop <= 64) return;
        setHideSearch(true);
      } else if (data.y > 200) {
        setHideSearch(false);
      }
    }
  }, []);

  return (
    <Grid
      container
      direction="column"
      classes={{
        root: classes.page,
      }}
      className="bottom-navigation-page"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Grid
        item
        component="div"
        className={cls(classes.padding, 'overflow-auto', 'flex-1')}
        onScroll={onScroll}
        ref={container}
      >
        <div className="text-center mb-2">
          <video
            className="w-full"
            id="player"
            ref={playerRef}
            controls={true}
            crossOrigin="anonymous"
          ></video>
        </div>
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
              onSelect={handlePlay}
            />
          </>
        ) : null}
      </Grid>
      <Search show={!hideSearch} onConfirm={onConfirmSearch} ref={searchRef} />
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

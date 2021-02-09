import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useContext,
} from 'react';
import Hls from 'hls.js';
import PlayList from '../components/PlayList';
import { useListDialog } from '../components/ListDialog';
import { WorkDetail } from '../components/WorkDetail';
import workApis, { FindWorksResponse } from '../apis/work';
import { ListItemText, Grid, makeStyles } from '@material-ui/core';
import { GlobalContext, GlobalContextValue } from '../contexts';
import { PlayerContext, Player } from '../hooks/usePlayer';
import useMount from '../hooks/useMount';
import { DBContext } from '../contexts/db';

const urlRegExp = /([a-zA-Z0-9]+:)?\/*?([^#?/:]+)(:\d+)?([^:#?]*?)(\?[^#]*)?(#.*)?$/;

const useStyles = makeStyles((theme) => ({
  page: {
    padding: '10px 10px 60px 10px',
  },
  secondary: {
    color: theme.palette.text.secondary,
  },
}));

function WorkItem(item: FindWorksResponse[0]) {
  const classes = useStyles({});
  const customStyles = {
    secondary: classes.secondary,
  };
  return (
    <>
      <ListItemText
        classes={customStyles}
        primary={item.name}
        secondary={item.tag}
      ></ListItemText>
      <ListItemText
        classes={customStyles}
        className="text-right"
        primary={item.cate}
        secondary={item.utime}
      ></ListItemText>
    </>
  );
}

function Home() {
  const classes = useStyles({});
  const [workList, setWorkList] = useState<FindWorksResponse>([]);
  const player = useContext(PlayerContext) as Player;
  const db = useContext(DBContext);
  const { setOpen, ListDialog } = useListDialog();
  const { showMessage, withLoading } = useContext(
    GlobalContext,
  ) as GlobalContextValue;
  const onSelectPlayList = useCallback(
    async (item: FindWorksResponse[0]) => {
      await player.selectPlayList(item);
      setOpen(false);
    },
    [setOpen, player],
  );

  const [inputValue, setInputValue] = useState('');

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
            db.set('history', url, {
              url,
              utime: Math.floor(new Date().valueOf() / 1000),
              chap: chap.name,
              work: {
                name: player.work.name,
                cate: player.work.cate,
                tag: player.work.tag,
                utime: player.work.utime,
                url: player.work.url,
                image: player.work.image,
              },
            });
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

  useMount(
    {
      player,
      db,
      handlePlay,
    },
    async ({ db, player, handlePlay }) => {
      try {
        const items = await db.getRange('history', 0, 1, {
          index: 'utime',
          order: 'prev',
        });
        if (items.length) {
          await player.selectPlayList(items[0].work);
          handlePlay(items[0].url);
        }
      } catch {
        //
      }
    },
  );

  return (
    <Grid
      container
      direction="column"
      classes={{
        root: classes.page,
      }}
      className="bottom-navigation-page"
    >
      <input
        className="w-full mb-2 bg-black input"
        id="url-input"
        placeholder="影片名称"
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Grid item className="overflow-auto flex-1">
        <div className="mb-2">
          <input
            id="replace-video-button"
            className="mr-1 btn"
            type="button"
            value="搜索影片"
            onClick={async () => {
              if (!inputValue.trim()) return showMessage('影片名称不可为空');
              const res = await withLoading(workApis.findWorks(inputValue));
              setWorkList(res);
              setOpen(true);
            }}
          />
        </div>
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
            <WorkDetail poster={player.work.image} name={player.work.name} />
            <PlayList
              currentUrl={player.videoUrl}
              work={player.work}
              onSelect={handlePlay}
            />
          </>
        ) : null}
      </Grid>
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

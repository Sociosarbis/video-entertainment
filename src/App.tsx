import React, { useCallback, useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import PlayList from './components/PlayList';
import { CustomThemeProvider } from './CustomThemeProvider';
import { useListDialog } from './components/ListDialog';
import { useLoading } from './components/Loading';
import { useMessage } from './components/Message';
import { WorkDetail } from './components/WorkDetail';
import workApis, { FindWorksResponse, Work } from './apis/work';
import { ListItemText, makeStyles } from '@material-ui/core';

const urlRegExp = /([a-zA-Z0-9]+:)?\/*?([^#?/:]+)(:\d+)?([^:#?]*?)(\?[^#]*)?(#.*)?$/;

const useStyles = makeStyles((theme) => ({
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

function App() {
  const [workList, setWorkList] = useState<FindWorksResponse>([]);
  const { setOpen, ListDialog } = useListDialog();
  const { showMessage, Message } = useMessage();
  const { withLoading, Loading } = useLoading();
  const [work, setWork] = useState<Work | null>(null);
  const onSelectPlayList = useCallback(
    async (item: FindWorksResponse[0]) => {
      const res = await withLoading(workApis.getPlayList(item.url));
      if (res.playList.length) {
        const work = Object.assign(item, res);
        setWork(work);
        window.localStorage.setItem('PREV_LIST', JSON.stringify(item));
      } else {
        showMessage('没发现可播放源');
      }
      setOpen(false);
    },
    [setOpen, showMessage, withLoading],
  );

  useEffect(() => {
    async function onMounted() {
      try {
        const prevWork: FindWorksResponse[0] = JSON.parse(
          window.localStorage.getItem('PREV_LIST') || '{}',
        );
        if (prevWork.url) {
          await withLoading(onSelectPlayList(prevWork));
        }
      } catch {
        //
      }
    }
    onMounted();
  }, [withLoading, setOpen, onSelectPlayList]);

  const [inputValue, setInputValue] = useState('');

  const [videoUrl, setVideoUrl] = useState('');

  const hlsRef = useRef<Hls | null>(null);

  const playerRef = useRef<HTMLVideoElement | null>(null);

  const handlePlay = useCallback((url: string) => {
    const player = playerRef.current as HTMLVideoElement;
    const hls = hlsRef.current as Hls;
    const match = url.trim().match(urlRegExp);
    hls.detachMedia();
    if (match) {
      let url = match[0];
      if (match[1] === 'http:') {
        url = url.replace(/^http:/, 'https:');
      }
      setInputValue(url);
      setVideoUrl(url);
      if (/\.m3u8/.test(url)) {
        hls.attachMedia(player);
        hls.loadSource(url);
      } else {
        setInputValue(url);
        player.setAttribute('src', url);
        player.play();
      }
    }
  }, []);

  useEffect(() => {
    const hls = new Hls();
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      (playerRef.current as HTMLVideoElement).play();
    });
    hlsRef.current = hls;
  }, []);

  return (
    <CustomThemeProvider>
      <div>
        <input
          className="w-full mb-2 bg-black input"
          id="url-input"
          placeholder="影片名称"
          onChange={(e) => setInputValue(e.target.value)}
        />
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
        {work ? <WorkDetail poster={work.image} name={work.name} /> : null}
        <PlayList currentUrl={videoUrl} work={work} onSelect={handlePlay} />
        <ListDialog
          list={workList}
          title="搜索结果"
          renderItem={WorkItem}
          onItemClick={onSelectPlayList}
        />
        <Message />
        <Loading />
      </div>
    </CustomThemeProvider>
  );
}

export default App;

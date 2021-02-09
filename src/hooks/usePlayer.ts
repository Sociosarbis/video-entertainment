import React, {
  useContext,
  useState,
  useCallback,
  createContext,
  useRef,
  useMemo,
} from 'react';
import { GlobalContext, GlobalContextValue } from '../contexts';
import workApis, { FindWorksResponse, Work } from '../apis/work';

export type Player = {
  work: Work | null;
  videoUrl: string;
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>;
  selectPlayList: (item: FindWorksResponse[0]) => Promise<void>;
  controller: React.MutableRefObject<{
    handlePlay: (url: string) => any;
  } | null>;
};

export default function usePlayer(): Player {
  const player = useMemo<Partial<Player>>(() => ({}), []);
  const controller = useRef(null);
  const { showMessage, withLoading } = useContext(
    GlobalContext,
  ) as GlobalContextValue;
  const [work, setWork] = useState<Work | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const selectPlayList = useCallback(
    async (item: FindWorksResponse[0]) => {
      if (work && item.url === work.url) return;
      const res = await withLoading(workApis.getPlayList(item.url));
      if (res.playList.length) {
        const work = Object.assign(item, res);
        setWork(work);
      } else {
        showMessage('没发现可播放源');
      }
    },
    [work, showMessage, withLoading],
  );

  return Object.assign(player, {
    videoUrl,
    setVideoUrl,
    work,
    controller,
    selectPlayList,
  });
}

export const PlayerContext = createContext<Player | null>(null);

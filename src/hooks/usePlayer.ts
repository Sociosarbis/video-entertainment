import React, {
  useContext,
  useState,
  useCallback,
  createContext,
  useRef,
  useMemo,
} from 'react';
import { GlobalContext, GlobalContextValue } from '../contexts';
import { FindWorksResponse, Work } from '../apis/work';
import { useApolloClient } from 'react-apollo';
import { gql } from 'apollo-boost';

export type Player = {
  work: Work | null;
  videoUrl: string;
  epIndex: number;
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>;
  selectPlayList: (
    item: Partial<FindWorksResponse[0]> & { id: number },
  ) => Promise<void>;
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
  const epIndex = useMemo(
    () => work?.playList.findIndex((item) => item.url === videoUrl) ?? -1,
    [videoUrl, work],
  );
  const client = useApolloClient();
  const selectPlayList = useCallback(
    async (item: FindWorksResponse[0]) => {
      if (work && item.id === work.id) return;
      const {
        data: { workDetail: res },
      } = await withLoading(
        client.query({
          query: gql`
            query GetPlayList($id: Int!) {
              workDetail(id: $id) {
                playList {
                  url
                  name
                }
                image
                infos {
                  name
                  cate
                  tag
                  utime
                }
              }
            }
          `,
          variables: {
            id: item.id,
          },
        }),
      );
      if (res.playList.length) {
        const work = Object.assign(item, {
          playList: res.playList,
          image: res.image,
          ...res.infos,
        });
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
    epIndex,
    controller,
    selectPlayList,
  });
}

export const PlayerContext = createContext<Player | null>(null);

import axios from '../helpers/axios';
import { Result as Infos } from './works';

const BASE_URL = 'https://api.apibdzy.com/api.php/provide/vod/';

type Resource = {
  name: string;
  url: string;
};

type Result = {
  infos: Infos;
  playList: Resource[];
  image: string;
};

type Input = {
  list: {
    vod_pic: string;
    vod_play_url: string;
    vod_name: string;
    type_name: string;
    vod_remarks: string;
    vod_time: string;
    vod_id: number;
  }[];
};

export async function resolve({ id }: { id: number }) {
  const page = (
    await axios.get<Input>(`${BASE_URL}`, {
      params: {
        ac: 'detail',
        ids: id,
      },
    })
  ).data;
  const item = page.list[0];
  const res: Result = {
    playList: [],
    image: item.vod_pic,
    infos: {
      name: item.vod_name,
      cate: item.type_name,
      tag: item.vod_remarks,
      utime: item.vod_time,
      id: item.vod_id,
    },
  };
  const $playLists = page.list[0].vod_play_url.split('$$$');
  for (let j = 0; j < $playLists.length; j++) {
    const $playList = $playLists[j];
    if (/m3u8/i.test($playList)) {
      const $items = $playList.split('#');
      const playList = [];
      for (let k = 0; k < $items.length; k++) {
        playList.push($items[k].trim());
      }
      res.playList = playList
        .map((line: string) => {
          const [name, url] = line.trim().split('$');
          return name && url
            ? {
                name,
                url: url.replace(/^http:/, 'https:'),
              }
            : null;
        })
        .filter(Boolean) as Resource[];
      break;
    }
  }
  return res;
}

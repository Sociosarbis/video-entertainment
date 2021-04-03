import axios from '../helpers/axios';

const BASE_URL = 'https://api.okzy.tv/api.php/provide/vod/at/json/';

type Resource = {
  name: string;
  url: string;
};

type Result = {
  playList: Resource[];
  image: string;
};

type Input = {
  list: { vod_pic: string; vod_play_url: string }[];
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
  const res: Result = {
    playList: [],
    image: page.list[0].vod_pic,
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

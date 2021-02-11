import axios from '../helpers/axios';
import cheerio from 'cheerio';

const BASE_URL = 'http://www.zuidazy3.net';

type Resource = {
  name: string;
  url: string;
};

type Result = {
  playList: Resource[];
  image: string;
};

export async function resolve({ url }: { url: string }) {
  const page = (await axios.get<string>(`${BASE_URL}${url}`)).data;
  const $ = cheerio.load(page);
  const $playInfos = $('.vodplayinfo');
  const res: Result = {
    playList: [],
    image: ($('.vodImg').find('img').attr('src') || '').trim(),
  };
  for (let i = 0; i < $playInfos.length; i++) {
    const $playLists = $playInfos.eq(i).children().first().children();
    for (let j = 0; j < $playLists.length; j++) {
      const $playList = $playLists.eq(j);
      const mediaType = $playList.find('.suf').text().trim();
      if (/m3u8/i.test(mediaType)) {
        const $items = $playList.find('li');
        const playList = [];
        for (let k = 0; k < $items.length; k++) {
          playList.push($items.eq(k).text().trim());
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
  }
  return res;
}

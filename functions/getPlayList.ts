import axios from './helpers/axios';
import cheerio from 'cheerio';
import { Response } from './model/response';

const BASE_URL = 'http://www.zuidazy3.net';

type Result = {
  playList: string;
  image: string;
};

async function handler(event: NetlifyFunction.Event) {
  const { url } = event.queryStringParameters;
  if (!url) {
    return new Response(400, {
      errMsg: '网址不可为空',
    });
  }
  try {
    const page = (await axios.get<string>(`${BASE_URL}${url}`)).data;
    const $ = cheerio.load(page);
    const $playInfos = $('.vodplayinfo');
    const res: Result = {
      playList: '',
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
          res.playList = playList.join('\n');
        }
      }
    }
    return new Response(200, res);
  } catch (e) {
    return new Response(500, {
      errMsg: e.message,
    });
  }
}

export { handler };

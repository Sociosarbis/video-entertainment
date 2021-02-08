import axios from './helpers/axios';
import cheerio from 'cheerio';
import { Response } from './model/response';
import { URLSearchParams } from 'url';

const API_URL = 'http://www.zuidazy3.net/index.php?m=vod-search';

type Result = {
  name: string;
  cate: string;
  tag: string;
  utime: string;
  url: string;
};

async function handler(event: NetlifyFunction.Event) {
  const { name } = event.queryStringParameters;
  if (!name) {
    return new Response(400, {
      errMsg: '请输入搜索名称',
    });
  }
  try {
    const page = (
      await axios.post<string>(
        API_URL,
        new URLSearchParams({
          wd: name,
          submit: 'search',
        }).toString(),
      )
    ).data;
    const $ = cheerio.load(page);
    const $results = $('.xing_vb > ul');
    const res: Result[] = [];
    for (let i = 0; i < $results.length; i++) {
      const $item = $results.eq(i);
      const $desc = $item.find('.xing_vb4').children('a');
      if ($desc.length) {
        const tag = $desc.children().first().text().trim();
        const name = $desc
          .text()
          .trim()
          .slice(0, tag.length === 0 ? undefined : -tag.length);
        const url = $desc.attr('href') || '';
        const utime = $item.find('.xing_vb6').text().trim();
        const cate = $item.find('.xing_vb5').text().trim();
        res.push({
          name,
          tag,
          url,
          utime,
          cate,
        });
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

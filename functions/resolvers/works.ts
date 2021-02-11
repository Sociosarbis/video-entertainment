import axios from '../helpers/axios';
import cheerio from 'cheerio';

const API_URL = 'http://www.zuidazy3.net/index.php?m=vod-search';

type Result = {
  name: string;
  cate: string;
  tag: string;
  utime: string;
  url: string;
};

export async function resolve({ keyword }: { keyword: string }) {
  const page = (
    await axios.post<string>(
      API_URL,
      new URLSearchParams({
        wd: keyword,
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
  return res;
}

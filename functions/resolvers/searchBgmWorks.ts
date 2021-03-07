import axios from '../helpers/axios';

const BASE_URL = 'https://api.bgm.tv/search/subject';

type Response = {
  id: number;
  name: string;
  type: number;
  name_cn: string;
  air_date: string;
  eps_count: number;
}[];

const SUBJECT_TYPES: Record<number, string> = {
  2: '动画',
  6: '三次元',
};

export async function resolve(keywords: string, type?: number) {
  const res: Response = (
    await axios.get(encodeURIComponent(keywords), {
      baseURL: BASE_URL,
      params: {
        type: isNaN(type as number) ? 2 : type,
        start: 0,
        max_results: 25,
      },
    })
  ).data.list;

  return res.map((item) => {
    return {
      id: item.id,
      name: item.name_cn || item.name,
      cate: item.type in SUBJECT_TYPES ? SUBJECT_TYPES[item.type] : '',
      tag: item.eps_count ? `话数：${item.eps_count}` : '',
      utime: item.air_date,
    };
  });
}

import axios from '../helpers/axios';

const BASE_URL = 'https://api.bgm.tv';

export type Response = {
  weekday: {
    cn: string;
    id: number;
  };
  items: {
    id: number;
    rating: {
      score: number;
    };
    name_cn: string;
    name: string;
    images: {
      common: string;
    };
  }[];
}[];

export async function resolve() {
  const res = await axios.get<Response>('/calendar', {
    baseURL: BASE_URL,
  });

  return res.data.map((item) => {
    return {
      text: item.weekday.cn,
      num: item.weekday.id,
      items: item.items
        .map((work) => {
          return {
            id: work.id,
            name: work.name_cn || work.name,
            score: work.rating && work.rating.score,
            image: ((work.images && work.images.common) || '').replace(
              /^http:/,
              'https:',
            ),
          };
        })
        .sort((a, b) => (b.score as number) - (a.score as number)),
    };
  });
}

import axios from '../helpers/axios';

const BASE_URL = 'https://api.bgm.tv';

type Response = {
  id: number;
  rating: {
    score: number;
  };
  name_cn: string;
  summary: string;
  images: {
    common: string;
  };
  eps: {
    id: number;
    name: string;
    name_cn?: string;
    desc: string;
    sort: number;
  }[];
};

export async function resolve({ id }: { id: number }) {
  const work = (
    await axios.get<Response>(`/subject/${id}/ep`, {
      baseURL: BASE_URL,
    })
  ).data;
  console.log(work);
  return {
    id: work.id,
    name: work.name_cn,
    score: work.rating && work.rating.score,
    image: work.images.common,
    summary: work.summary,
    eps: work.eps.map((item) => {
      (item.name = item.name_cn || item.name), delete item.name_cn;
      return item;
    }),
  };
}

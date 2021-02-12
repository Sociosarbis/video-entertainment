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
};

export async function resolve({ id }: { id: number }) {
  const work = (
    await axios.get<Response>(`/subject/${id}`, {
      baseURL: BASE_URL,
    })
  ).data;
  return {
    id: work.id,
    name: work.name_cn,
    score: work.rating && work.rating.score,
    image: work.images.common,
    summary: work.summary,
  };
}

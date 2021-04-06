import axios from '../helpers/axios';

const API_URL = 'https://www.mhapi123.com/inc/api_mac10.php';

type Result = {
  name: string;
  cate: string;
  tag: string;
  utime: string;
  id: number;
};

type Input = {
  list: {
    vod_name: string;
    type_name: string;
    vod_remarks: string;
    vod_time: string;
    vod_id: number;
  }[];
};

export async function resolve({ keyword }: { keyword: string }) {
  const page = (
    await axios.get<Input>(API_URL, {
      params: {
        wd: keyword,
        ac: 'list',
      },
    })
  ).data;
  const res: Result[] = page.list.map((item) => ({
    name: item.vod_name,
    cate: item.type_name,
    tag: item.vod_remarks,
    utime: item.vod_time,
    id: item.vod_id,
  }));
  return res;
}

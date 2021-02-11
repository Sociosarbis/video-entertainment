import axios from 'axios';
import { db } from '../contexts/db';

const axiosInst = axios.create({
  baseURL: '.netlify/functions',
});

axiosInst.interceptors.response.use((response) => {
  return response.data;
});

export type FindWorksResponse = {
  name: string;
  cate: string;
  tag: string;
  utime: string;
  url: string;
}[];

export type Resource = {
  name: string;
  url: string;
};

export type GetPlayListResponse = {
  playList: Resource[];
  image: string;
};

export type HistoryItem = {
  url: string;
  chap: string;
  utime: number;
  workUrl: string;
};

export type Work = FindWorksResponse[0] & GetPlayListResponse;

export type GetHistoryFromDBResult = HistoryItem & { work: Work };
class WorkApis {
  async findWorks(name: string): Promise<FindWorksResponse> {
    return axiosInst.get('findWorks', {
      params: {
        name,
      },
    });
  }

  async getPlayList(url: string): Promise<GetPlayListResponse> {
    return await axiosInst.get<any, any>('getPlayList', {
      params: {
        url,
      },
    });
  }

  async getWorkFromDB(url: string) {
    return await db.get<Work>('work', url);
  }

  async getHistoryFromDB(offset: number, size: number) {
    const items = await db.getRange<HistoryItem>('history', offset, size, {
      index: 'utime',
      order: 'prev',
    });
    const workMap = items.reduce((acc, item) => {
      if (item.workUrl) {
        acc[item.workUrl] = null;
      }
      return acc;
    }, {} as Record<string, Work | null>);
    for (const key in workMap) {
      const work = await db.get<Work>('work', key);
      if (work) {
        workMap[key] = work;
      }
    }
    return items
      .filter((item) => workMap[item.workUrl])
      .map((item) =>
        Object.assign(item, { work: workMap[item.workUrl] as Work }),
      );
  }
}

export default new WorkApis();

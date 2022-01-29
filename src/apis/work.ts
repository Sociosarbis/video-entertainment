import axios from 'axios';
import ApolloClient, { gql } from 'apollo-boost';
import { db } from '../contexts/db';

const axiosInst = axios.create({
  baseURL: '.netlify/functions',
});

export const client = new ApolloClient({
  uri: '/.netlify/functions/graphql',
});

axiosInst.interceptors.response.use((response) => {
  return response.data;
});

export type FindWorksResponse = {
  name: string;
  keywords: string;
  cate: string;
  tag: string;
  utime: string;
  id: number;
}[];

export type FindBgmWorksResponse = (FindWorksResponse[0] & { id: number })[];

export type GetBgmWorkDetailResponse = {
  id: number;
  eps: {
    id: number;
    name: string;
    desc: string;
    sort: number;
    comment: number;
    airdate: string;
  }[];
};

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
  id: number;
  currentTime?: number;
  duration?: number;
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

  async getPlayList(id: number): Promise<GetPlayListResponse> {
    return await axiosInst.get<any, any>('getPlayList', {
      params: {
        id,
      },
    });
  }

  async getWorkFromDB(id: number) {
    return await db.get<Work>('work', String(id));
  }

  async listWorksFromDB(offset: number, size: number) {
    return await db.getRange<Work>('work', offset, size, {
      index: 'visited_at',
      order: 'prev',
    });
  }

  async getHistoryFromDB(offset: number, size: number, id?: number) {
    const items = await db.getRange<HistoryItem>('history', offset, size, {
      index: 'id-utime',
      query: id
        ? IDBKeyRange.bound([id, 0], [id, Number.MAX_SAFE_INTEGER])
        : undefined,
      order: 'prev',
    });
    const workMap = items.reduce((acc, item) => {
      if (item.id) {
        acc[item.id] = null;
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
      .filter((item) => workMap[item.id])
      .map((item) => Object.assign(item, { work: workMap[item.id] as Work }));
  }

  async findBgmWork(keywords: string): Promise<FindBgmWorksResponse> {
    return (
      await client.query({
        query: gql`
          query FindBgmWork($keywords: String!) {
            bgmWorks(keywords: $keywords) {
              id
              name
              cate
              tag
              utime
            }
          }
        `,
        variables: {
          keywords,
        },
      })
    ).data.bgmWorks;
  }

  async getBgmWorkDetail(id: number): Promise<GetBgmWorkDetailResponse> {
    return (
      await client.query({
        query: gql`
          query GetBgmWorkDetail($id: Int!) {
            subjectDetail(id: $id) {
              id
              eps {
                id
                name
                desc
                sort
                airdate
                comment
              }
            }
          }
        `,
        variables: {
          id,
        },
      })
    ).data.subjectDetail;
  }
}

export default new WorkApis();

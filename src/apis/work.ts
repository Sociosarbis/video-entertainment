import axios from 'axios';

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

export type Work = FindWorksResponse[0] & GetPlayListResponse;

class WorkApis {
  async findWorks(name: string): Promise<FindWorksResponse> {
    return axiosInst.get('findWorks', {
      params: {
        name,
      },
    });
  }

  async getPlayList(url: string): Promise<GetPlayListResponse> {
    const res = await axiosInst.get<any, any>('getPlayList', {
      params: {
        url,
      },
    });
    res.playList = res.playList
      .split('\n')
      .map((line: string) => {
        const [name, url] = line.trim().split('$');
        return name && url
          ? {
              name,
              url: url.replace(/^http:/, 'https:'),
            }
          : null;
      })
      .filter(Boolean) as Resource[];
    return res;
  }
}

export default new WorkApis();

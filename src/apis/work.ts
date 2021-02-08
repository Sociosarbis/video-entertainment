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

export type GetPlayListResponse = {
  playList: string;
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

  getPlayList(url: string): Promise<GetPlayListResponse> {
    return axiosInst.get('getPlayList', {
      params: {
        url,
      },
    });
  }
}

export default new WorkApis();

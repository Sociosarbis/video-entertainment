import axios from 'axios';

const axiosInstance = axios.create({
  /*proxy: {
    host: '127.0.0.1',
    port: 8899,
  },*/
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36 Edg/88.0.705.68',
  },
});

export default axiosInstance;

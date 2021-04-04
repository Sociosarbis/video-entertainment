import axios, { AxiosRequestConfig } from 'axios';
import dns from 'dns';
import net from 'net';

const defaultDNSServers = dns.getServers();

export const HunanDNSServers = ['58.20.127.238', '58.20.127.170'];

export type ExtendedRequestConfig = AxiosRequestConfig & {
  DNSServers?: string[];
};

const axiosInstance = axios.create({
  /*
  proxy: {
    host: '127.0.0.1',
    port: 8899,
  },*/
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36 Edg/88.0.705.68',
  },
});

axiosInstance.interceptors.request.use(function (
  config: ExtendedRequestConfig,
) {
  const url = new URL(config.url as string);
  if (net.isIP(url.hostname) || !config.DNSServers) {
    return config;
  } else {
    dns.setServers(config.DNSServers);
    return dns.promises
      .resolve(url.hostname, 'A')
      .then(function (addresses) {
        dns.setServers(defaultDNSServers);
        if (addresses.length) {
          config.headers = config.headers || {};
          config.headers.Host = url.hostname; // put original hostname in Host header

          url.hostname = addresses[0];
          config.url = url.toString();
        }
        return config;
      })
      .catch(() => {
        dns.setServers(defaultDNSServers);
        return config;
      });
  }
});

export default axiosInstance;

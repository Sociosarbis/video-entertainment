import axios from 'axios';

export default axios.create(
  process.env.NETLIFY
    ? {}
    : {
        proxy: {
          host: '127.0.0.1',
          port: 10809,
        },
      },
);

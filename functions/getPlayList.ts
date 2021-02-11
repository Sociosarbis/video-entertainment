import { Response } from './model/response';
import { resolve as resolveWorkDetail } from './resolvers/workDetail';

async function handler(event: NetlifyFunction.Event) {
  const { url } = event.queryStringParameters;
  if (!url) {
    return new Response(400, {
      errMsg: '网址不可为空',
    });
  }
  try {
    return new Response(200, await resolveWorkDetail({ url }));
  } catch (e) {
    return new Response(500, {
      errMsg: e.message,
    });
  }
}

export { handler };

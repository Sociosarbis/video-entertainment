import { Response } from './model/response';
import { resolve as resolveWorks } from './resolvers/works';

async function handler(event: NetlifyFunction.Event) {
  const { name } = event.queryStringParameters;
  if (!name) {
    return new Response(400, {
      errMsg: '请输入搜索名称',
    });
  }
  try {
    return new Response(200, await resolveWorks({ keyword: name }));
  } catch (e) {
    return new Response(500, {
      errMsg: e.message,
    });
  }
}

export { handler };

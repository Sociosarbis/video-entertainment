declare namespace NetlifyFunction {
  type Event = {
    queryStringParameters: Record<string, string>;
    httpMethod: string;
    body: string;
    path: string;
    isBase64Encoded: boolean;
  };
}

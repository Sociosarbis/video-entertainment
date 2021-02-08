class Response {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
  constructor(statusCode: number, data: any) {
    this.statusCode = statusCode;
    this.body =
      typeof data === 'string'
        ? data
        : Buffer.from(JSON.stringify(data)).toString('utf-8');
    this.headers = {
      'content-type': 'application/json;charset=UTF-8',
    };
  }
}

export { Response };

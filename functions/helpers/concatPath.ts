const PATH_COMMANDS = {
  PREV: -1,
  NEXT: 1,
  SEEK: 2,
  END: 4,
};

function isRelative(path: string) {
  return path[0] !== '/';
}

export function hasProtocol(path: string) {
  return /^\w+:[\\/]{2}/.test(path);
}

function parsePath(path: string) {
  path = path.replace(/\\/g, '/');
  const hasEnd = path.endsWith('/');
  if (path[path.length - 1] !== '/') path += '/';
  let dots = 0;
  let subPath = '';
  const ret = [];
  if (!isRelative(path)) ret.push([PATH_COMMANDS.SEEK, 0]);
  for (let i = 0; i < path.length; i++) {
    switch (path[i]) {
      case '.':
        dots++;
        break;
      case '/':
        switch (dots) {
          case 1:
            break;
          case 2:
            ret.push([PATH_COMMANDS.PREV]);
            dots = 0;
            break;
          default:
            subPath += '.'.repeat(dots);
            if (subPath.length > 0) {
              ret.push([PATH_COMMANDS.NEXT, subPath]);
              dots = 0;
              subPath = '';
            }
        }
        break;
      default:
        if (dots > 0) {
          subPath += '.'.repeat(dots);
          dots = 0;
        }
        subPath += path[i];
    }
  }
  if (hasEnd) ret.push([PATH_COMMANDS.END]);
  return ret;
}

export function concatPath(base: string, path: string) {
  const match = base.match(/^(\w+:)/);
  const protocol = match ? match[0] : '';
  const opsList = [parsePath(base.substring(protocol.length)), parsePath(path)];
  const context: string[] = [];
  let index = context.length - 1;
  let hasEnd = false;
  opsList.forEach((ops) => {
    if (ops.length && !hasEnd) {
      if (ops[0][0] === PATH_COMMANDS.NEXT) {
        context.pop();
      }
    }
    hasEnd = false;
    for (let i = 0; i < ops.length; i++) {
      switch (ops[i][0]) {
        case PATH_COMMANDS.PREV:
          index--;
          context.splice(index + 1);
          break;
        case PATH_COMMANDS.SEEK:
          index = Number(ops[i][1]);
          context.splice(index + 1);
          break;
        case PATH_COMMANDS.NEXT:
          context.push(String(ops[i][1]));
          index = context.length - 1;
          break;
        case PATH_COMMANDS.END:
          hasEnd = true;
          break;
        default:
      }
    }
  });
  return `${protocol ? `${protocol}//` : ''}${context.join('/')}${
    hasEnd ? '/' : ''
  }`;
}

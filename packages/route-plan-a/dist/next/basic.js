export const routeConfig = {
  RSP: '|',
  historyMax: 10,
  homeUri: '|home|{app:{}}'
};
export function setRouteConfig(conf) {
  conf.RSP !== undefined && (routeConfig.RSP = conf.RSP);
  conf.historyMax && (routeConfig.historyMax = conf.historyMax);
  conf.homeUri && (routeConfig.homeUri = conf.homeUri);
}
export function extractNativeLocation(routeState) {
  const data = Object.assign({}, routeState);
  ['tag', 'params', 'action', 'key', 'history', 'stack'].forEach(key => {
    delete data[key];
  });
  return data;
}
export function locationToUri(location, key) {
  return [key, location.tag, JSON.stringify(location.params)].join(routeConfig.RSP);
}

function splitUri(...args) {
  const [uri, name] = args;
  const arr = uri.split(routeConfig.RSP, 3);
  const index = {
    key: 0,
    tag: 1,
    query: 2
  };

  if (name) {
    return arr[index[name]];
  }

  return arr;
}

export function uriToLocation(uri) {
  const [key, tag, query] = splitUri(uri);
  const location = {
    tag,
    params: JSON.parse(query)
  };
  return {
    key,
    location
  };
}
export function buildHistoryStack(location, action, key, curData) {
  const maxLength = routeConfig.historyMax;
  const tag = location.tag;
  const uri = locationToUri(location, key);
  const {
    history,
    stack
  } = curData;
  let historyList = [...history];
  let stackList = [...stack];

  if (action === 'RELAUNCH') {
    historyList = [uri];
    stackList = [uri];
  } else if (action === 'PUSH') {
    historyList.unshift(uri);

    if (historyList.length > maxLength) {
      historyList.length = maxLength;
    }

    if (splitUri(stackList[0], 'tag') !== tag) {
      stackList.unshift(uri);

      if (stackList.length > maxLength) {
        stackList.length = maxLength;
      }
    } else {
      stackList[0] = uri;
    }
  } else if (action === 'REPLACE') {
    historyList[0] = uri;
    stackList[0] = uri;

    if (tag === splitUri(stackList[1], 'tag')) {
      stackList.splice(1, 1);
    }

    if (stackList.length > maxLength) {
      stackList.length = maxLength;
    }
  } else if (action.startsWith('POP')) {
    const n = parseInt(action.replace('POP', ''), 10) || 1;
    const useStack = n > 1000;

    if (useStack) {
      historyList = [];
      stackList.splice(0, n - 1000);
    } else {
      const arr = historyList.splice(0, n + 1, uri).reduce((pre, curUri) => {
        const ctag = splitUri(curUri, 'tag');

        if (pre[pre.length - 1] !== ctag) {
          pre.push(ctag);
        }

        return pre;
      }, []);

      if (arr[arr.length - 1] === splitUri(historyList[1], 'tag')) {
        arr.pop();
      }

      stackList.splice(0, arr.length, uri);

      if (tag === splitUri(stackList[1], 'tag')) {
        stackList.splice(1, 1);
      }
    }
  }

  return {
    history: historyList,
    stack: stackList
  };
}
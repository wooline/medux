"use strict";

exports.__esModule = true;
exports.setRouteConfig = setRouteConfig;
exports.extractNativeLocation = extractNativeLocation;
exports.locationToUri = locationToUri;
exports.uriToLocation = uriToLocation;
exports.buildHistoryStack = buildHistoryStack;
exports.routeConfig = void 0;
var routeConfig = {
  RSP: '|',
  historyMax: 10,
  homeUri: '|home|{app:{}}'
};
exports.routeConfig = routeConfig;

function setRouteConfig(conf) {
  conf.RSP !== undefined && (routeConfig.RSP = conf.RSP);
  conf.historyMax && (routeConfig.historyMax = conf.historyMax);
  conf.homeUri && (routeConfig.homeUri = conf.homeUri);
}

function extractNativeLocation(routeState) {
  var data = Object.assign({}, routeState);
  ['tag', 'params', 'action', 'key', 'history', 'stack'].forEach(function (key) {
    delete data[key];
  });
  return data;
}

function locationToUri(location, key) {
  return [key, location.tag, JSON.stringify(location.params)].join(routeConfig.RSP);
}

function splitUri() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var uri = args[0],
      name = args[1];
  var arr = uri.split(routeConfig.RSP, 3);
  var index = {
    key: 0,
    tag: 1,
    query: 2
  };

  if (name) {
    return arr[index[name]];
  }

  return arr;
}

function uriToLocation(uri) {
  var _splitUri = splitUri(uri),
      key = _splitUri[0],
      tag = _splitUri[1],
      query = _splitUri[2];

  var location = {
    tag: tag,
    params: JSON.parse(query)
  };
  return {
    key: key,
    location: location
  };
}

function buildHistoryStack(location, action, key, curData) {
  var maxLength = routeConfig.historyMax;
  var tag = location.tag;
  var uri = locationToUri(location, key);
  var history = curData.history,
      stack = curData.stack;
  var historyList = [].concat(history);
  var stackList = [].concat(stack);

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
    var n = parseInt(action.replace('POP', ''), 10) || 1;
    var useStack = n > 1000;

    if (useStack) {
      historyList = [];
      stackList.splice(0, n - 1000);
    } else {
      var arr = historyList.splice(0, n + 1, uri).reduce(function (pre, curUri) {
        var ctag = splitUri(curUri, 'tag');

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
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export var routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  pagenames: {},
  defaultParams: {},
  disableNativeRoute: false
};
export function setRouteConfig(conf) {
  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
  conf.disableNativeRoute && (routeConfig.disableNativeRoute = true);
  conf.pagenames && (routeConfig.pagenames = conf.pagenames);
}

function splitQuery(query) {
  return (query || '').split('&').reduce(function (params, str) {
    var sections = str.split('=');

    if (sections.length > 1) {
      var _key = sections[0],
          arr = sections.slice(1);

      if (!params) {
        params = {};
      }

      params[_key] = decodeURIComponent(arr.join('='));
    }

    return params;
  }, undefined);
}

function joinQuery(params) {
  return Object.keys(params || {}).map(function (key) {
    return key + "=" + encodeURIComponent(params[key]);
  }).join('&');
}

export function nativeUrlToNativeLocation(url) {
  if (!url) {
    return {
      pathname: '/',
      searchData: undefined,
      hashData: undefined
    };
  }

  var arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  var path = arr[0],
      search = arr[1],
      hash = arr[2];
  return {
    pathname: "/" + path.replace(/^\/+|\/+$/g, ''),
    searchData: splitQuery(search),
    hashData: splitQuery(hash)
  };
}
export function nativeLocationToNativeUrl(_ref) {
  var pathname = _ref.pathname,
      searchData = _ref.searchData,
      hashData = _ref.hashData;
  var search = joinQuery(searchData);
  var hash = joinQuery(hashData);
  return ["/" + pathname.replace(/^\/+|\/+$/g, ''), search && "?" + search, hash && "#" + hash].join('');
}

function locationToUri(location, key) {
  var pagename = location.pagename,
      params = location.params;
  var query = params ? JSON.stringify(params) : '';
  return {
    uri: [key, pagename, query].join('|'),
    pagename: pagename,
    query: query,
    key: key
  };
}

function splitUri() {
  for (var _len = arguments.length, args = new Array(_len), _key2 = 0; _key2 < _len; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var _args$ = args[0],
      uri = _args$ === void 0 ? '' : _args$,
      name = args[1];

  var _uri$split = uri.split('|'),
      key = _uri$split[0],
      pagename = _uri$split[1],
      others = _uri$split.slice(2);

  var arr = [key, pagename, others.join('|')];
  var index = {
    key: 0,
    pagename: 1,
    query: 2
  };

  if (name) {
    return arr[index[name]];
  }

  return arr;
}

export function uriToLocation(uri) {
  var _splitUri = splitUri(uri),
      key = _splitUri[0],
      pagename = _splitUri[1],
      query = _splitUri[2];

  var location = {
    pagename: pagename,
    params: JSON.parse(query)
  };
  return {
    key: key,
    location: location
  };
}
export var History = function () {
  function History() {
    _defineProperty(this, "pages", []);

    _defineProperty(this, "actions", []);
  }

  var _proto = History.prototype;

  _proto.getActionRecord = function getActionRecord(keyOrIndex) {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }

    if (typeof keyOrIndex === 'number') {
      return this.actions[keyOrIndex];
    }

    return this.actions.find(function (item) {
      return item.key === keyOrIndex;
    });
  };

  _proto.getPageRecord = function getPageRecord(keyOrIndex) {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }

    if (typeof keyOrIndex === 'number') {
      return this.pages[keyOrIndex];
    }

    return this.pages.find(function (item) {
      return item.key === keyOrIndex;
    });
  };

  _proto.getActionIndex = function getActionIndex(key) {
    return this.actions.findIndex(function (item) {
      return item.key === key;
    });
  };

  _proto.getPageIndex = function getPageIndex(key) {
    return this.pages.findIndex(function (item) {
      return item.key === key;
    });
  };

  _proto.getCurrentInternalHistory = function getCurrentInternalHistory() {
    return this.actions[0].sub;
  };

  _proto.getUriStack = function getUriStack() {
    return {
      actions: this.actions.map(function (item) {
        return item.uri;
      }),
      pages: this.pages.map(function (item) {
        return item.uri;
      })
    };
  };

  _proto.push = function push(location, key) {
    var _pages$;

    var _locationToUri = locationToUri(location, key),
        uri = _locationToUri.uri,
        pagename = _locationToUri.pagename,
        query = _locationToUri.query;

    var newStack = {
      uri: uri,
      pagename: pagename,
      query: query,
      key: key,
      sub: new History()
    };
    var pages = [].concat(this.pages);
    var actions = [].concat(this.actions);
    var actionsMax = routeConfig.actionMaxHistory;
    var pagesMax = routeConfig.pagesMaxHistory;
    actions.unshift(newStack);

    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }

    if (splitUri((_pages$ = pages[0]) == null ? void 0 : _pages$.uri, 'pagename') !== pagename) {
      pages.unshift(newStack);

      if (pages.length > pagesMax) {
        pages.length = pagesMax;
      }
    } else {
      pages[0] = newStack;
    }

    this.actions = actions;
    this.pages = pages;
  };

  _proto.replace = function replace(location, key) {
    var _pages$2;

    var _locationToUri2 = locationToUri(location, key),
        uri = _locationToUri2.uri,
        pagename = _locationToUri2.pagename,
        query = _locationToUri2.query;

    var newStack = {
      uri: uri,
      pagename: pagename,
      query: query,
      key: key,
      sub: new History()
    };
    var pages = [].concat(this.pages);
    var actions = [].concat(this.actions);
    var pagesMax = routeConfig.pagesMaxHistory;
    actions[0] = newStack;
    pages[0] = newStack;

    if (pagename === splitUri((_pages$2 = pages[1]) == null ? void 0 : _pages$2.uri, 'pagename')) {
      pages.splice(1, 1);
    }

    if (pages.length > pagesMax) {
      pages.length = pagesMax;
    }

    this.actions = actions;
    this.pages = pages;
  };

  _proto.relaunch = function relaunch(location, key) {
    var _locationToUri3 = locationToUri(location, key),
        uri = _locationToUri3.uri,
        pagename = _locationToUri3.pagename,
        query = _locationToUri3.query;

    var newStack = {
      uri: uri,
      pagename: pagename,
      query: query,
      key: key,
      sub: new History()
    };
    var actions = [newStack];
    var pages = [newStack];
    this.actions = actions;
    this.pages = pages;
  };

  _proto.pop = function pop(n) {
    var historyRecord = this.getPageRecord(n);

    if (!historyRecord) {
      return false;
    }

    var pages = [].concat(this.pages);
    var actions = [];
    pages.splice(0, n);
    this.actions = actions;
    this.pages = pages;
    return true;
  };

  _proto.back = function back(n) {
    var _actions$, _pages$3;

    var historyRecord = this.getActionRecord(n);

    if (!historyRecord) {
      return false;
    }

    var uri = historyRecord.uri;
    var pagename = splitUri(uri, 'pagename');
    var pages = [].concat(this.pages);
    var actions = [].concat(this.actions);
    var deleteActions = actions.splice(0, n + 1, historyRecord);
    var arr = deleteActions.reduce(function (pre, curStack) {
      var ctag = splitUri(curStack.uri, 'pagename');

      if (pre[pre.length - 1] !== ctag) {
        pre.push(ctag);
      }

      return pre;
    }, []);

    if (arr[arr.length - 1] === splitUri((_actions$ = actions[1]) == null ? void 0 : _actions$.uri, 'pagename')) {
      arr.pop();
    }

    pages.splice(0, arr.length, historyRecord);

    if (pagename === splitUri((_pages$3 = pages[1]) == null ? void 0 : _pages$3.uri, 'pagename')) {
      pages.splice(1, 1);
    }

    this.actions = actions;
    this.pages = pages;
    return true;
  };

  return History;
}();
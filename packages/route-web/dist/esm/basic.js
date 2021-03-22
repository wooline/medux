import _extends from "@babel/runtime/helpers/esm/extends";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export var routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  pagenames: {},
  defaultParams: {},
  disableNativeRoute: false,
  indexUrl: ''
};
export function setRouteConfig(conf) {
  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
  conf.disableNativeRoute && (routeConfig.disableNativeRoute = true);
  conf.pagenames && (routeConfig.pagenames = conf.pagenames);
  conf.indexUrl && (routeConfig.indexUrl = conf.indexUrl);
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
export function locationToUri(location, key) {
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

function isHistoryRecord(data) {
  return data['uri'];
}

export var History = function () {
  function History(data, parent) {
    _defineProperty(this, "curRecord", void 0);

    _defineProperty(this, "pages", []);

    _defineProperty(this, "actions", []);

    this.parent = parent;

    if (isHistoryRecord(data)) {
      this.curRecord = data;
    } else {
      var _locationToUri = locationToUri(data.location, data.key),
          _uri = _locationToUri.uri,
          pagename = _locationToUri.pagename,
          query = _locationToUri.query;

      this.curRecord = {
        uri: _uri,
        pagename: pagename,
        query: query,
        key: data.key,
        sub: new History({
          uri: _uri,
          pagename: pagename,
          query: query,
          key: data.key
        }, this)
      };
    }
  }

  var _proto = History.prototype;

  _proto.getLength = function getLength() {
    return this.actions.length;
  };

  _proto.getRecord = function getRecord(keyOrIndex) {
    if (typeof keyOrIndex === 'number') {
      if (keyOrIndex === -1) {
        keyOrIndex = this.actions.length - 1;
      }

      return this.actions[keyOrIndex];
    }

    return this.actions.find(function (item) {
      return item.key === keyOrIndex;
    });
  };

  _proto.findIndex = function findIndex(key) {
    return this.actions.findIndex(function (item) {
      return item.key === key;
    });
  };

  _proto.getCurrentInternalHistory = function getCurrentInternalHistory() {
    return this.curRecord.sub;
  };

  _proto.getStack = function getStack() {
    return this.actions;
  };

  _proto.getUriStack = function getUriStack() {
    return this.actions.map(function (item) {
      return item.uri;
    });
  };

  _proto.getPageStack = function getPageStack() {
    return this.pages;
  };

  _proto.push = function push(location, key) {
    var _pages$;

    var historyRecord = this.curRecord;

    var _locationToUri2 = locationToUri(location, key),
        uri = _locationToUri2.uri,
        pagename = _locationToUri2.pagename,
        query = _locationToUri2.query;

    this.curRecord = {
      uri: uri,
      pagename: pagename,
      query: query,
      key: key,
      sub: new History({
        uri: uri,
        pagename: pagename,
        query: query,
        key: key
      }, this)
    };
    var pages = [].concat(this.pages);
    var actions = [].concat(this.actions);
    var actionsMax = routeConfig.actionMaxHistory;
    var pagesMax = routeConfig.pagesMaxHistory;
    actions.unshift(historyRecord);

    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }

    if (splitUri((_pages$ = pages[0]) == null ? void 0 : _pages$.uri, 'pagename') !== pagename) {
      pages.unshift(historyRecord);

      if (pages.length > pagesMax) {
        pages.length = pagesMax;
      }
    } else {
      pages[0] = historyRecord;
    }

    this.actions = actions;
    this.pages = pages;

    if (this.parent) {
      this.parent.curRecord = _extends({}, this.parent.curRecord, {
        uri: uri,
        pagename: pagename,
        query: query
      });
    }
  };

  _proto.replace = function replace(location, key) {
    var _locationToUri3 = locationToUri(location, key),
        uri = _locationToUri3.uri,
        pagename = _locationToUri3.pagename,
        query = _locationToUri3.query;

    this.curRecord = {
      uri: uri,
      pagename: pagename,
      query: query,
      key: key,
      sub: new History({
        uri: uri,
        pagename: pagename,
        query: query,
        key: key
      }, this)
    };

    if (this.parent) {
      this.parent.curRecord = _extends({}, this.parent.curRecord, {
        uri: uri,
        pagename: pagename,
        query: query
      });
    }
  };

  _proto.relaunch = function relaunch(location, key) {
    var _locationToUri4 = locationToUri(location, key),
        uri = _locationToUri4.uri,
        pagename = _locationToUri4.pagename,
        query = _locationToUri4.query;

    this.curRecord = {
      uri: uri,
      pagename: pagename,
      query: query,
      key: key,
      sub: new History({
        uri: uri,
        pagename: pagename,
        query: query,
        key: key
      }, this)
    };
    this.actions = [];
    this.pages = [];

    if (this.parent) {
      this.parent.curRecord = _extends({}, this.parent.curRecord, {
        uri: uri,
        pagename: pagename,
        query: query
      });
    }
  };

  _proto.back = function back(delta) {
    var _actions$;

    var historyRecord = this.getRecord(delta - 1);

    if (!historyRecord) {
      return false;
    }

    this.curRecord = historyRecord;
    var uri = historyRecord.uri,
        pagename = historyRecord.pagename,
        query = historyRecord.query;
    var pages = [].concat(this.pages);
    var actions = [].concat(this.actions);
    var deleteActions = actions.splice(0, delta);
    var arr = deleteActions.reduce(function (pre, curStack) {
      var ctag = splitUri(curStack.uri, 'pagename');

      if (pre[pre.length - 1] !== ctag) {
        pre.push(ctag);
      }

      return pre;
    }, []);

    if (arr[arr.length - 1] === splitUri((_actions$ = actions[0]) == null ? void 0 : _actions$.uri, 'pagename')) {
      arr.pop();
    }

    pages.splice(0, arr.length);
    this.actions = actions;
    this.pages = pages;

    if (this.parent) {
      this.parent.curRecord = _extends({}, this.parent.curRecord, {
        uri: uri,
        pagename: pagename,
        query: query
      });
    }

    return true;
  };

  return History;
}();
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export var routeConfig = {
  RSP: '|',
  historyMax: 10,
  homeUri: '|home|{app:{}}'
};
export function setRouteConfig(conf) {
  conf.RSP !== undefined && (routeConfig.RSP = conf.RSP);
  conf.historyMax && (routeConfig.historyMax = conf.historyMax);
  conf.homeUri && (routeConfig.homeUri = conf.homeUri);
}

function locationToUri(location, key) {
  var pagename = location.pagename,
      params = location.params;
  var query = params ? JSON.stringify(params) : '';
  return {
    uri: [key, pagename, query].join(routeConfig.RSP),
    pagename: pagename,
    query: query,
    key: key
  };
}

function splitUri() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _args$ = args[0],
      uri = _args$ === void 0 ? '' : _args$,
      name = args[1];
  var arr = uri.split(routeConfig.RSP, 3);
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
    _defineProperty(this, "pagesMax", 10);

    _defineProperty(this, "actionsMax", 10);

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
    var actionsMax = this.actionsMax;
    var pagesMax = this.pagesMax;
    actions.unshift(newStack);

    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }

    if (splitUri((_pages$ = pages[0]) === null || _pages$ === void 0 ? void 0 : _pages$.uri, 'pagename') !== pagename) {
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
    var pagesMax = this.pagesMax;
    actions[0] = newStack;
    pages[0] = newStack;

    if (pagename === splitUri((_pages$2 = pages[1]) === null || _pages$2 === void 0 ? void 0 : _pages$2.uri, 'pagename')) {
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

    if (arr[arr.length - 1] === splitUri((_actions$ = actions[1]) === null || _actions$ === void 0 ? void 0 : _actions$.uri, 'pagename')) {
      arr.pop();
    }

    pages.splice(0, arr.length, historyRecord);

    if (pagename === splitUri((_pages$3 = pages[1]) === null || _pages$3 === void 0 ? void 0 : _pages$3.uri, 'pagename')) {
      pages.splice(1, 1);
    }

    this.actions = actions;
    this.pages = pages;
    return true;
  };

  return History;
}();
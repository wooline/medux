"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.setRouteConfig = setRouteConfig;
exports.extractNativeLocation = extractNativeLocation;
exports.uriToLocation = uriToLocation;
exports.History = exports.routeConfig = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

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
  ['tag', 'params', 'action', 'key'].forEach(function (key) {
    delete data[key];
  });
  return data;
}

function locationToUri(location, key) {
  var tag = location.tag,
      params = location.params;
  var query = params ? JSON.stringify(params) : '';
  return {
    uri: [key, tag, query].join(routeConfig.RSP),
    tag: tag,
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

var History = function () {
  function History() {
    (0, _defineProperty2.default)(this, "groupMax", 10);
    (0, _defineProperty2.default)(this, "actionsMax", 10);
    (0, _defineProperty2.default)(this, "groups", []);
    (0, _defineProperty2.default)(this, "actions", []);
  }

  var _proto = History.prototype;

  _proto.getAction = function getAction(keyOrIndex) {
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

  _proto.getGroup = function getGroup(keyOrIndex) {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }

    if (typeof keyOrIndex === 'number') {
      return this.groups[keyOrIndex];
    }

    return this.groups.find(function (item) {
      return item.key === keyOrIndex;
    });
  };

  _proto.getActionIndex = function getActionIndex(key) {
    return this.actions.findIndex(function (item) {
      return item.key === key;
    });
  };

  _proto.getGroupIndex = function getGroupIndex(key) {
    return this.groups.findIndex(function (item) {
      return item.key === key;
    });
  };

  _proto.getCurrentInternalHistory = function getCurrentInternalHistory() {
    return this.actions[0].sub;
  };

  _proto.findTag = function findTag(tag) {};

  _proto.getUriStack = function getUriStack() {
    return {
      actions: this.actions.map(function (item) {
        return item.uri;
      }),
      groups: this.groups.map(function (item) {
        return item.uri;
      })
    };
  };

  _proto.push = function push(location, key) {
    var _groups$;

    var _locationToUri = locationToUri(location, key),
        uri = _locationToUri.uri,
        tag = _locationToUri.tag,
        query = _locationToUri.query;

    var newStack = {
      uri: uri,
      tag: tag,
      query: query,
      key: key,
      sub: new History()
    };
    var groups = [].concat(this.groups);
    var actions = [].concat(this.actions);
    var actionsMax = this.actionsMax;
    var groupMax = this.groupMax;
    actions.unshift(newStack);

    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }

    if (splitUri((_groups$ = groups[0]) === null || _groups$ === void 0 ? void 0 : _groups$.uri, 'tag') !== tag) {
      groups.unshift(newStack);

      if (groups.length > groupMax) {
        groups.length = groupMax;
      }
    } else {
      groups[0] = newStack;
    }

    this.actions = actions;
    this.groups = groups;
  };

  _proto.replace = function replace(location, key) {
    var _groups$2;

    var _locationToUri2 = locationToUri(location, key),
        uri = _locationToUri2.uri,
        tag = _locationToUri2.tag,
        query = _locationToUri2.query;

    var newStack = {
      uri: uri,
      tag: tag,
      query: query,
      key: key,
      sub: new History()
    };
    var groups = [].concat(this.groups);
    var actions = [].concat(this.actions);
    var groupMax = this.groupMax;
    actions[0] = newStack;
    groups[0] = newStack;

    if (tag === splitUri((_groups$2 = groups[1]) === null || _groups$2 === void 0 ? void 0 : _groups$2.uri, 'tag')) {
      groups.splice(1, 1);
    }

    if (groups.length > groupMax) {
      groups.length = groupMax;
    }

    this.actions = actions;
    this.groups = groups;
  };

  _proto.relaunch = function relaunch(location, key) {
    var _locationToUri3 = locationToUri(location, key),
        uri = _locationToUri3.uri,
        tag = _locationToUri3.tag,
        query = _locationToUri3.query;

    var newStack = {
      uri: uri,
      tag: tag,
      query: query,
      key: key,
      sub: new History()
    };
    var actions = [newStack];
    var groups = [newStack];
    this.actions = actions;
    this.groups = groups;
  };

  _proto.pop = function pop(n) {
    var historyRecord = this.getGroup(n);

    if (!historyRecord) {
      return false;
    }

    var groups = [].concat(this.groups);
    var actions = [];
    groups.splice(0, n);
    this.actions = actions;
    this.groups = groups;
    return true;
  };

  _proto.back = function back(n) {
    var _actions$, _groups$3;

    var historyRecord = this.getAction(n);

    if (!historyRecord) {
      return false;
    }

    var uri = historyRecord.uri;
    var tag = splitUri(uri, 'tag');
    var groups = [].concat(this.groups);
    var actions = [].concat(this.actions);
    var deleteActions = actions.splice(0, n + 1, historyRecord);
    var arr = deleteActions.reduce(function (pre, curStack) {
      var ctag = splitUri(curStack.uri, 'tag');

      if (pre[pre.length - 1] !== ctag) {
        pre.push(ctag);
      }

      return pre;
    }, []);

    if (arr[arr.length - 1] === splitUri((_actions$ = actions[1]) === null || _actions$ === void 0 ? void 0 : _actions$.uri, 'tag')) {
      arr.pop();
    }

    groups.splice(0, arr.length, historyRecord);

    if (tag === splitUri((_groups$3 = groups[1]) === null || _groups$3 === void 0 ? void 0 : _groups$3.uri, 'tag')) {
      groups.splice(1, 1);
    }

    this.actions = actions;
    this.groups = groups;
    return true;
  };

  return History;
}();

exports.History = History;
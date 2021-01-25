import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
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
  ['tag', 'params', 'action', 'key'].forEach(key => {
    delete data[key];
  });
  return data;
}

function locationToUri(location, key) {
  const {
    tag,
    params
  } = location;
  const query = params ? JSON.stringify(params) : '';
  return {
    uri: [key, tag, query].join(routeConfig.RSP),
    tag,
    query,
    key
  };
}

function splitUri(...args) {
  const [uri = '', name] = args;
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
export class History {
  constructor() {
    _defineProperty(this, "groupMax", 10);

    _defineProperty(this, "actionsMax", 10);

    _defineProperty(this, "groups", []);

    _defineProperty(this, "actions", []);
  }

  getAction(keyOrIndex) {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }

    if (typeof keyOrIndex === 'number') {
      return this.actions[keyOrIndex];
    }

    return this.actions.find(item => item.key === keyOrIndex);
  }

  getGroup(keyOrIndex) {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }

    if (typeof keyOrIndex === 'number') {
      return this.groups[keyOrIndex];
    }

    return this.groups.find(item => item.key === keyOrIndex);
  }

  getActionIndex(key) {
    return this.actions.findIndex(item => item.key === key);
  }

  getGroupIndex(key) {
    return this.groups.findIndex(item => item.key === key);
  }

  getCurrentInternalHistory() {
    return this.actions[0].sub;
  }

  findTag(tag) {}

  getUriStack() {
    return {
      actions: this.actions.map(item => item.uri),
      groups: this.groups.map(item => item.uri)
    };
  }

  push(location, key) {
    var _groups$;

    const {
      uri,
      tag,
      query
    } = locationToUri(location, key);
    const newStack = {
      uri,
      tag,
      query,
      key,
      sub: new History()
    };
    const groups = [...this.groups];
    const actions = [...this.actions];
    const actionsMax = this.actionsMax;
    const groupMax = this.groupMax;
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
  }

  replace(location, key) {
    var _groups$2;

    const {
      uri,
      tag,
      query
    } = locationToUri(location, key);
    const newStack = {
      uri,
      tag,
      query,
      key,
      sub: new History()
    };
    const groups = [...this.groups];
    const actions = [...this.actions];
    const groupMax = this.groupMax;
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
  }

  relaunch(location, key) {
    const {
      uri,
      tag,
      query
    } = locationToUri(location, key);
    const newStack = {
      uri,
      tag,
      query,
      key,
      sub: new History()
    };
    const actions = [newStack];
    const groups = [newStack];
    this.actions = actions;
    this.groups = groups;
  }

  pop(n) {
    const historyRecord = this.getGroup(n);

    if (!historyRecord) {
      return false;
    }

    const groups = [...this.groups];
    const actions = [];
    groups.splice(0, n);
    this.actions = actions;
    this.groups = groups;
    return true;
  }

  back(n) {
    var _actions$, _groups$3;

    const historyRecord = this.getAction(n);

    if (!historyRecord) {
      return false;
    }

    const uri = historyRecord.uri;
    const tag = splitUri(uri, 'tag');
    const groups = [...this.groups];
    const actions = [...this.actions];
    const deleteActions = actions.splice(0, n + 1, historyRecord);
    const arr = deleteActions.reduce((pre, curStack) => {
      const ctag = splitUri(curStack.uri, 'tag');

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
  }

}
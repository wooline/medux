import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export const routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  pagenames: {},
  defaultParams: {}
};
export function setRouteConfig(conf) {
  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
}

function locationToUri(location, key) {
  const {
    pagename,
    params
  } = location;
  const query = params ? JSON.stringify(params) : '';
  return {
    uri: [key, pagename, query].join('|'),
    pagename,
    query,
    key
  };
}

function splitUri(...args) {
  const [uri = '', name] = args;
  const [key, pagename, ...others] = uri.split('|');
  const arr = [key, pagename, others.join('|')];
  const index = {
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
  const [key, pagename, query] = splitUri(uri);
  const location = {
    pagename,
    params: JSON.parse(query)
  };
  return {
    key,
    location
  };
}
export class History {
  constructor() {
    _defineProperty(this, "pages", []);

    _defineProperty(this, "actions", []);
  }

  getActionRecord(keyOrIndex) {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }

    if (typeof keyOrIndex === 'number') {
      return this.actions[keyOrIndex];
    }

    return this.actions.find(item => item.key === keyOrIndex);
  }

  getPageRecord(keyOrIndex) {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }

    if (typeof keyOrIndex === 'number') {
      return this.pages[keyOrIndex];
    }

    return this.pages.find(item => item.key === keyOrIndex);
  }

  getActionIndex(key) {
    return this.actions.findIndex(item => item.key === key);
  }

  getPageIndex(key) {
    return this.pages.findIndex(item => item.key === key);
  }

  getCurrentInternalHistory() {
    return this.actions[0].sub;
  }

  getUriStack() {
    return {
      actions: this.actions.map(item => item.uri),
      pages: this.pages.map(item => item.uri)
    };
  }

  push(location, key) {
    var _pages$;

    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    const newStack = {
      uri,
      pagename,
      query,
      key,
      sub: new History()
    };
    const pages = [...this.pages];
    const actions = [...this.actions];
    const actionsMax = routeConfig.actionMaxHistory;
    const pagesMax = routeConfig.pagesMaxHistory;
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
  }

  replace(location, key) {
    var _pages$2;

    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    const newStack = {
      uri,
      pagename,
      query,
      key,
      sub: new History()
    };
    const pages = [...this.pages];
    const actions = [...this.actions];
    const pagesMax = routeConfig.pagesMaxHistory;
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
  }

  relaunch(location, key) {
    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    const newStack = {
      uri,
      pagename,
      query,
      key,
      sub: new History()
    };
    const actions = [newStack];
    const pages = [newStack];
    this.actions = actions;
    this.pages = pages;
  }

  pop(n) {
    const historyRecord = this.getPageRecord(n);

    if (!historyRecord) {
      return false;
    }

    const pages = [...this.pages];
    const actions = [];
    pages.splice(0, n);
    this.actions = actions;
    this.pages = pages;
    return true;
  }

  back(n) {
    var _actions$, _pages$3;

    const historyRecord = this.getActionRecord(n);

    if (!historyRecord) {
      return false;
    }

    const uri = historyRecord.uri;
    const pagename = splitUri(uri, 'pagename');
    const pages = [...this.pages];
    const actions = [...this.actions];
    const deleteActions = actions.splice(0, n + 1, historyRecord);
    const arr = deleteActions.reduce((pre, curStack) => {
      const ctag = splitUri(curStack.uri, 'pagename');

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
  }

}
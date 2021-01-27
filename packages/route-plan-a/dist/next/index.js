import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { CoreModuleHandlers, config, reducer, deepMerge, deepMergeState, mergeState } from '@medux/core';
import { uriToLocation, History } from './basic';
export { setRouteConfig } from './basic';
export { PagenameMap, createLocationTransform, createPathnameTransform } from './transform';
export let RouteModuleHandlers = _decorate(null, function (_initialize, _CoreModuleHandlers) {
  class RouteModuleHandlers extends _CoreModuleHandlers {
    constructor(...args) {
      super(...args);

      _initialize(this);
    }

  }

  return {
    F: RouteModuleHandlers,
    d: [{
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        const routeParams = this.rootState.route.params[this.moduleName];
        return routeParams ? deepMergeState(initState, routeParams) : initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return deepMergeState(this.state, payload);
      }
    }]
  };
}, CoreModuleHandlers);
export const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `medux${config.NSP}RouteChange`,
  BeforeRouteChange: `medux${config.NSP}BeforeRouteChange`
};
export function beforeRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState]
  };
}
export function routeParamsAction(moduleName, params, action) {
  return {
    type: `${moduleName}${config.NSP}${RouteActionTypes.MRouteParams}`,
    payload: [params, action]
  };
}
export function routeChangeAction(routeState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState]
  };
}
export const routeMiddleware = ({
  dispatch,
  getState
}) => next => action => {
  if (action.type === RouteActionTypes.RouteChange) {
    const routeState = action.payload[0];
    const rootRouteParams = routeState.params;
    const rootState = getState();
    Object.keys(rootRouteParams).forEach(moduleName => {
      const routeParams = rootRouteParams[moduleName];

      if (routeParams) {
        var _rootState$moduleName;

        if ((_rootState$moduleName = rootState[moduleName]) !== null && _rootState$moduleName !== void 0 && _rootState$moduleName.initialized) {
          dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
        }
      }
    });
  }

  return next(action);
};
export const routeReducer = (state, action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    return mergeState(state, action.payload[0]);
  }

  return state;
};
export class BaseRouter {
  constructor(initUrl, nativeRouter, locationTransform) {
    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "nativeLocation", void 0);

    _defineProperty(this, "url", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "history", void 0);

    this.url = initUrl;
    this.nativeLocation = this.urlToNativeLocation(initUrl);
    const location = this.locationTransform.in(this.nativeLocation);

    const key = this._createKey();

    this.history = new History();
    const routeState = Object.assign({}, location, {
      action: 'RELAUNCH',
      key
    });
    this.routeState = routeState;
    this.history.relaunch(location, key);
  }

  getRouteState() {
    return this.routeState;
  }

  getNativeLocation() {
    return this.nativeLocation;
  }

  getUrl() {
    return this.url;
  }

  setStore(_store) {
    this.store = _store;
  }

  getCurKey() {
    return this.routeState.key;
  }

  _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  payloadToLocation(data) {
    const {
      pagename
    } = data;
    const extendParams = data.extendParams === true ? this.routeState.params : data.extendParams;
    const params = extendParams && data.params ? deepMerge({}, extendParams, data.params) : data.params;
    return {
      pagename: pagename || this.routeState.pagename || '/',
      params
    };
  }

  urlToToLocation(url) {
    const nativeLocation = this.urlToNativeLocation(url);
    return this.locationTransform.in(nativeLocation);
  }

  urlToNativeLocation(url) {
    if (!url) {
      return {
        pathname: '/',
        search: '',
        hash: ''
      };
    }

    const arr = url.split(/[?#]/);

    if (arr.length === 2 && url.indexOf('?') < 0) {
      arr.splice(1, 0, '');
    }

    const [path, search = '', hash = ''] = arr;
    let pathname = path;

    if (!pathname.startsWith('/')) {
      pathname = `/${pathname}`;
    }

    pathname = pathname.replace(/\/*$/, '') || '/';
    return {
      pathname,
      search,
      hash
    };
  }

  nativeLocationToUrl(nativeLocation) {
    const {
      pathname,
      search,
      hash
    } = nativeLocation;
    return [pathname && pathname.replace(/\/*$/, ''), search && `?${search}`, hash && `#${hash}`].join('');
  }

  locationToUrl(location) {
    const nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToUrl(nativeLocation);
  }

  async relaunch(data, internal) {
    const location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);

    const key = this._createKey();

    const routeState = Object.assign({}, location, {
      action: 'RELAUNCH',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }

    this.nativeRouter.relaunch(this.url, key, !!internal);
    return routeState;
  }

  async push(data, internal) {
    const location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);

    const key = this._createKey();

    const routeState = Object.assign({}, location, {
      action: 'PUSH',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    if (internal) {
      this.history.getCurrentInternalHistory().push(location, key);
    } else {
      this.history.push(location, key);
    }

    this.nativeRouter.push(this.url, key, !!internal);
    return routeState;
  }

  async replace(data, internal) {
    const location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);

    const key = this._createKey();

    const routeState = Object.assign({}, location, {
      action: 'REPLACE',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    if (internal) {
      this.history.getCurrentInternalHistory().replace(location, key);
    } else {
      this.history.replace(location, key);
    }

    this.nativeRouter.replace(this.url, key, !!internal);
    return routeState;
  }

  async back(n = 1, internal) {
    const stack = internal ? this.history.getCurrentInternalHistory().getActionRecord(n) : this.history.getActionRecord(n);

    if (!stack) {
      return Promise.reject(1);
    }

    const uri = stack.uri;
    const {
      key,
      location
    } = uriToLocation(uri);
    const routeState = Object.assign({}, location, {
      action: 'BACK',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
    }

    this.nativeRouter.back(this.url, n, key, !!internal);
    return routeState;
  }

  async pop(n = 1, internal) {
    const stack = internal ? this.history.getCurrentInternalHistory().getPageRecord(n) : this.history.getPageRecord(n);

    if (!stack) {
      return Promise.reject(1);
    }

    const uri = stack.uri;
    const {
      key,
      location
    } = uriToLocation(uri);
    const routeState = Object.assign({}, location, {
      action: 'POP',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);

    if (internal) {
      this.history.getCurrentInternalHistory().pop(n);
    } else {
      this.history.pop(n);
    }

    this.nativeRouter.pop(this.url, n, key, !!internal);
    return routeState;
  }

}
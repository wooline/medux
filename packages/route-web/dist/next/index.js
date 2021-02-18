import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { CoreModuleHandlers, config, reducer, deepMergeState, mergeState, env, deepMerge } from '@medux/core';
import { uriToLocation, nativeUrlToNativeLocation, nativeLocationToNativeUrl, History } from './basic';
export { setRouteConfig, routeConfig } from './basic';
export { PagenameMap, createLocationTransform } from './transform';
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
  constructor(nativeLocationOrNativeUrl, nativeRouter, locationTransform) {
    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "_nativeData", void 0);

    _defineProperty(this, "_getNativeUrl", this.getNativeUrl.bind(this));

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "meduxUrl", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "history", void 0);

    const location = typeof nativeLocationOrNativeUrl === 'string' ? this.nativeUrlToLocation(nativeLocationOrNativeUrl) : this.nativeLocationToLocation(nativeLocationOrNativeUrl);

    const key = this._createKey();

    const routeState = Object.assign({}, location, {
      action: 'RELAUNCH',
      key
    });
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this._nativeData = undefined;
    this.history = new History();
    this.history.relaunch(location, key);
    this.nativeRouter.relaunch(this._getNativeUrl, key, false);
  }

  getRouteState() {
    return this.routeState;
  }

  getPagename() {
    return this.routeState.pagename;
  }

  getParams() {
    return this.routeState.params;
  }

  getMeduxUrl() {
    return this.meduxUrl;
  }

  getNativeLocation() {
    if (!this._nativeData) {
      const nativeLocation = this.locationTransform.out(this.routeState);
      const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {
        nativeLocation,
        nativeUrl
      };
    }

    return this._nativeData.nativeLocation;
  }

  getNativeUrl() {
    if (!this._nativeData) {
      const nativeLocation = this.locationTransform.out(this.routeState);
      const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {
        nativeLocation,
        nativeUrl
      };
    }

    return this._nativeData.nativeUrl;
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

  nativeUrlToNativeLocation(url) {
    return nativeUrlToNativeLocation(url);
  }

  nativeLocationToLocation(nativeLocation) {
    let location;

    try {
      location = this.locationTransform.in(nativeLocation);
    } catch (error) {
      env.console.warn(error);
      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  }

  nativeUrlToLocation(nativeUrl) {
    return this.nativeLocationToLocation(this.nativeUrlToNativeLocation(nativeUrl));
  }

  urlToLocation(url) {
    const [pathname, ...others] = url.split('?');
    const query = others.join('?');
    let location;

    try {
      if (query.startsWith('{')) {
        const data = JSON.parse(query);
        location = this.locationTransform.in({
          pagename: pathname,
          params: data
        });
      } else {
        const nativeLocation = this.nativeUrlToNativeLocation(url);
        location = this.locationTransform.in(nativeLocation);
      }
    } catch (error) {
      env.console.warn(error);
      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  }

  nativeLocationToNativeUrl(nativeLocation) {
    return nativeLocationToNativeUrl(nativeLocation);
  }

  locationToNativeUrl(location) {
    const nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToNativeUrl(nativeLocation);
  }

  locationToMeduxUrl(location) {
    return [location.pagename, JSON.stringify(location.params || {})].join('?');
  }

  payloadToPartial(payload) {
    let params = payload.params;
    const extendParams = payload.extendParams === 'current' ? this.routeState.params : payload.extendParams;

    if (extendParams && params) {
      params = deepMerge({}, extendParams, params);
    } else if (extendParams) {
      params = extendParams;
    }

    return {
      pagename: payload.pagename || this.routeState.pagename,
      params: params || {}
    };
  }

  async relaunch(data, internal) {
    let location;

    if (typeof data === 'string') {
      location = this.urlToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }

    const key = this._createKey();

    const routeState = Object.assign({}, location, {
      action: 'RELAUNCH',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this._nativeData = undefined;
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }

    this.nativeRouter.relaunch(this._getNativeUrl, key, !!internal);
    return routeState;
  }

  async push(data, internal) {
    let location;

    if (typeof data === 'string') {
      location = this.urlToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }

    const key = this._createKey();

    const routeState = Object.assign({}, location, {
      action: 'PUSH',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this._nativeData = undefined;
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().push(location, key);
    } else {
      this.history.push(location, key);
    }

    this.nativeRouter.push(this._getNativeUrl, key, !!internal);
    return routeState;
  }

  async replace(data, internal) {
    let location;

    if (typeof data === 'string') {
      location = this.urlToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }

    const key = this._createKey();

    const routeState = Object.assign({}, location, {
      action: 'REPLACE',
      key
    });
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this._nativeData = undefined;
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().replace(location, key);
    } else {
      this.history.replace(location, key);
    }

    this.nativeRouter.replace(this._getNativeUrl, key, !!internal);
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
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this._nativeData = undefined;
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
    }

    this.nativeRouter.back(this._getNativeUrl, n, key, !!internal);
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
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this._nativeData = undefined;
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().pop(n);
    } else {
      this.history.pop(n);
    }

    this.nativeRouter.pop(this._getNativeUrl, n, key, !!internal);
    return routeState;
  }

}
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { CoreModuleHandlers, config, reducer, deepMerge, deepMergeState, mergeState } from '@medux/core';
import { uriToLocation, extractNativeLocation, History } from './basic';
export { createWebLocationTransform } from './transform';
export { PathnameRules, extractPathParams } from './matchPath';
export { setRouteConfig } from './basic';
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
  constructor(initLocation, nativeRouter, locationTransform) {
    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "_routeState", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "history", void 0);

    const location = this.locationTransform.in(initLocation);

    const key = this._createKey();

    this.history = new History();
    const routeState = this.locationToRouteState(location, 'RELAUNCH', key);
    this._routeState = routeState;
    this.history.relaunch(location, key);
    const nativeLocation = extractNativeLocation(routeState);
    nativeRouter.relaunch(nativeLocation, key);
  }

  getRouteState() {
    return this._routeState;
  }

  setStore(_store) {
    this.store = _store;
  }

  getCurKey() {
    return this._routeState.key;
  }

  _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  payloadToLocation(data) {
    if (typeof data === 'string') {
      const nativeLocation = this.nativeRouter.parseUrl(data);
      return this.locationTransform.in(nativeLocation);
    }

    const {
      tag
    } = data;
    const extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
    const params = extendParams && data.params ? deepMerge({}, extendParams, data.params) : data.params;
    return {
      tag: tag || this._routeState.tag || '/',
      params
    };
  }

  locationToUrl(data) {
    const {
      tag
    } = data;
    const extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
    const params = extendParams && data.params ? deepMerge({}, extendParams, data.params) : data.params;
    const nativeLocation = this.locationTransform.out({
      tag: tag || this._routeState.tag || '/',
      params
    });
    return this.nativeRouter.toUrl(nativeLocation);
  }

  locationToRouteState(location, action, key) {
    const natvieLocation = this.locationTransform.out(location);
    return Object.assign({}, location, {
      action,
      key
    }, natvieLocation);
  }

  async relaunch(data, internal) {
    const paLocation = this.payloadToLocation(data);

    const key = this._createKey();

    const routeState = this.locationToRouteState(paLocation, 'RELAUNCH', key);
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(paLocation, key);
    } else {
      this.history.relaunch(paLocation, key);
      const nativeLocation = extractNativeLocation(routeState);
      this.nativeRouter.relaunch(nativeLocation, key);
    }

    return routeState;
  }

  async push(data, internal) {
    const paLocation = this.payloadToLocation(data);

    const key = this._createKey();

    const routeState = this.locationToRouteState(paLocation, 'PUSH', key);
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().push(paLocation, key);
    } else {
      this.history.push(paLocation, key);
      const nativeLocation = extractNativeLocation(routeState);
      this.nativeRouter.push(nativeLocation, key);
    }

    return routeState;
  }

  async replace(data, internal) {
    const paLocation = this.payloadToLocation(data);

    const key = this._createKey();

    const routeState = this.locationToRouteState(paLocation, 'REPLACE', key);
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().replace(paLocation, key);
    } else {
      this.history.replace(paLocation, key);
      const nativeLocation = extractNativeLocation(routeState);
      this.nativeRouter.replace(nativeLocation, key);
    }

    return routeState;
  }

  async back(n = 1, internal) {
    const stack = internal ? this.history.getCurrentInternalHistory().getAction(n) : this.history.getAction(n);

    if (!stack) {
      return Promise.reject(1);
    }

    const uri = stack.uri;
    const {
      key,
      location: paLocation
    } = uriToLocation(uri);
    const routeState = this.locationToRouteState(paLocation, 'BACK', key);
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
      const nativeLocation = extractNativeLocation(routeState);
      this.nativeRouter.back(nativeLocation, n, key);
    }

    return routeState;
  }

  async pop(n = 1, internal) {
    const stack = internal ? this.history.getCurrentInternalHistory().getGroup(n) : this.history.getGroup(n);

    if (!stack) {
      return Promise.reject(1);
    }

    const uri = stack.uri;
    const {
      key,
      location: paLocation
    } = uriToLocation(uri);
    const routeState = this.locationToRouteState(paLocation, 'POP', key);
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().pop(n);
    } else {
      this.history.pop(n);
      const nativeLocation = extractNativeLocation(routeState);
      this.nativeRouter.pop(nativeLocation, n, key);
    }

    return routeState;
  }

}
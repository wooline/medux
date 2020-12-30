import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { CoreModuleHandlers, config, reducer, deepMerge, deepMergeState } from '@medux/core';
import { buildHistoryStack, routeConfig, uriToLocation, locationToUri, extractNativeLocation } from './basic';
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
    return action.payload[0];
  }

  return state;
};
export class BaseHistoryActions {
  constructor(nativeHistory, locationTransform) {
    this.nativeHistory = nativeHistory;
    this.locationTransform = locationTransform;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "_routeState", void 0);

    _defineProperty(this, "_startupUri", void 0);

    _defineProperty(this, "store", void 0);

    const location = this.locationTransform.in(nativeHistory.getLocation());

    const key = this._createKey();

    const routeState = this.locationToRouteState(location, 'RELAUNCH', key);
    this._routeState = routeState;
    this._startupUri = locationToUri(location, key);
    const nativeLocation = extractNativeLocation(routeState);
    nativeHistory.relaunch(nativeLocation, key);
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

  findHistoryByKey(key) {
    const {
      history
    } = this._routeState;
    return history.findIndex(uri => uri.startsWith(`${key}${routeConfig.RSP}`));
  }

  payloadToLocation(data) {
    if (typeof data === 'string') {
      const nativeLocation = this.nativeHistory.parseUrl(data);
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
    return this.nativeHistory.toUrl(nativeLocation);
  }

  locationToRouteState(location, action, key) {
    const {
      history,
      stack
    } = buildHistoryStack(location, action, key, this._routeState || {
      history: [],
      stack: []
    });
    const natvieLocation = this.locationTransform.out(location);
    return Object.assign({}, location, {
      action,
      key,
      history,
      stack
    }, natvieLocation);
  }

  async dispatch(location, action, key = '', callNative) {
    key = key || this._createKey();
    const routeState = this.locationToRouteState(location, action, key);
    await this.store.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    await this.store.dispatch(routeChangeAction(routeState));

    if (callNative) {
      const nativeLocation = extractNativeLocation(routeState);

      if (typeof callNative === 'number') {
        this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative, key);
      } else {
        this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation, key);
      }
    }

    return routeState;
  }

  relaunch(data, disableNative) {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'RELAUNCH', '', disableNative ? '' : 'relaunch');
  }

  push(data, disableNative) {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'PUSH', '', disableNative ? '' : 'push');
  }

  replace(data, disableNative) {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'REPLACE', '', disableNative ? '' : 'replace');
  }

  pop(n = 1, root = 'FIRST', disableNative, useStack) {
    n = n || 1;
    let uri = useStack ? this._routeState.stack[n] : this._routeState.history[n];
    let k = useStack ? 1000 + n : n;

    if (!uri) {
      k = 1000000;

      if (root === 'HOME') {
        uri = routeConfig.homeUri;
      } else if (root === 'FIRST') {
        uri = this._startupUri;
      } else {
        return Promise.reject(1);
      }
    }

    const {
      key,
      location
    } = uriToLocation(uri);
    return this.dispatch(location, `POP${k}`, key, disableNative ? '' : k);
  }

  back(n = 1, root = 'FIRST', disableNative) {
    return this.pop(n, root, disableNative, true);
  }

  home(root = 'FIRST', disableNative) {
    return this.relaunch(root === 'HOME' ? routeConfig.homeUri : this._startupUri, disableNative);
  }

}
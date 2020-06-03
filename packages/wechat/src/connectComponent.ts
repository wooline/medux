import {Connect, diffData, getPrevData} from './utils';
import {cacheModule, env, getClientStore, loadModel} from '@medux/core';

import {Unsubscribe} from 'redux';

export const connectComponent: Connect<WechatMiniprogram.Component.Constructor> = (module, mapStateToProps, mapDispatchToProps) => {
  cacheModule(module);
  return function (config: meduxCore.ComponentConfig) {
    let unsubscribe: Unsubscribe | undefined;
    let ready = false;

    function onStateChange(this: meduxCore.ComponentConfig): void {
      if (!unsubscribe) {
        return;
      }
      if (mapStateToProps) {
        const nextState = mapStateToProps(getClientStore().getState() as any, this.data as any);
        const prevState = getPrevData(nextState, this.data || {});
        const updateData = diffData(prevState, nextState);
        updateData && this.setData!(updateData);
      }
    }
    function created(this: meduxCore.ComponentConfig): void {
      loadModel(module.default.moduleName);
      config.lifetimes?.created?.call(this);
    }
    function attached(this: meduxCore.ComponentConfig): void {
      //loadModel(view.__moduleName!);
      if (mapStateToProps) {
        unsubscribe = getClientStore().subscribe(onStateChange.bind(this));
        onStateChange.call(this);
      }
      config.lifetimes?.attached?.call(this);
      ready = true;
    }
    function detached(this: meduxCore.ComponentConfig): void {
      config.lifetimes?.detached?.call(this);
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
    }
    function show(this: meduxCore.ComponentConfig): void {
      if (ready && mapStateToProps && !unsubscribe) {
        unsubscribe = getClientStore().subscribe(onStateChange.bind(this));
        onStateChange.call(this);
      }
      config.pageLifetimes?.show?.call(this);
    }
    function hide(this: meduxCore.ComponentConfig): void {
      config.pageLifetimes?.hide?.call(this);
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
    }
    const mergeConfig: meduxCore.ComponentConfig = {
      ...config,
      methods: {
        ...config.methods,
        ...(mapDispatchToProps && mapDispatchToProps(getClientStore().dispatch as any, config.data as any)),
        dispatch: getClientStore()!.dispatch,
      },
      lifetimes: {
        ...config.lifetimes,
        created,
        attached,
        detached,
      },
      pageLifetimes: {
        ...config.pageLifetimes,
        show,
        hide,
      },
    };
    return env.Component(mergeConfig);
  };
};

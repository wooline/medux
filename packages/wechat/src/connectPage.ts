import {Connect, diffData, getPrevData} from './utils';
import {getClientStore, loadModel, env} from '@medux/core';

import {Unsubscribe} from 'redux';

export const connectPage: Connect<WechatMiniprogram.Page.Constructor> = (moduleName, mapStateToProps, mapDispatchToProps) => {
  return (config: meduxCore.PageConfig) => {
    let unsubscribe: Unsubscribe | undefined;
    let ready = false;
    //let loadOption: any;

    function onStateChange(this: meduxCore.PageConfig): void {
      if (!unsubscribe) {
        return;
      }
      if (mapStateToProps) {
        const nextState = mapStateToProps(getClientStore().getState() as any, this.data as any);
        const prevState = getPrevData(nextState, this.data || {});
        const updateData = diffData(prevState, nextState);
        updateData && this.setData!(diffData);
      }
    }

    function onLoad(this: meduxCore.PageConfig, option: any): void {
      //loadOption = option;
      loadModel(moduleName);
      if (mapStateToProps) {
        unsubscribe = getClientStore().subscribe(onStateChange.bind(this));
        onStateChange.call(this);
      }
      config.onLoad?.call(this, option);
      ready = true;
    }
    function onUnload(this: meduxCore.PageConfig): void {
      config.onUnload?.call(this);
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
    }
    function onShow(this: meduxCore.PageConfig): void {
      if (ready && mapStateToProps && !unsubscribe) {
        unsubscribe = getClientStore().subscribe(onStateChange.bind(this));
        onStateChange.call(this);
      }
      config.onShow?.call(this);
    }
    function onHide(this: meduxCore.PageConfig): void {
      config.onHide?.call(this);
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
    }
    const mergeConfig: meduxCore.PageConfig = {
      ...config,
      ...(mapDispatchToProps ? mapDispatchToProps(getClientStore()!.dispatch as any, config.data as any) : {}),
      onLoad,
      onUnload,
      onShow,
      onHide,
    };

    return env.Page(mergeConfig);
  };
};

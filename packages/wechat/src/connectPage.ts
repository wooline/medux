import {MapDispatchToProps, MapStateToProps, Props, diffData, getPrevData} from './utils';
import {getClientStore, loadModel} from '@medux/core';

import {Unsubscribe} from 'redux';

export type PageConfigWithInjected<TInjectedProps, TInjectedMethods> = <C extends meduxCore.PageConfig>(config: C) => C & TInjectedMethods & {data: TInjectedProps};

export function connectPage<TInjectedProps = Props, TInjectedMethods = Props, TOwnProps = Props, TState = Props>(
  moduleName: string,
  mapStateToProps?: MapStateToProps<TInjectedProps, TOwnProps, TState>,
  mapDispatchToProps?: MapDispatchToProps<TInjectedMethods, TOwnProps>
): PageConfigWithInjected<TInjectedProps, TInjectedMethods> {
  return <C extends meduxCore.PageConfig>(config: C) => {
    let unsubscribe: Unsubscribe | undefined;
    let ready = false;
    //let loadOption: any;

    function onStateChange(this: meduxCore.PageConfig): void {
      if (!unsubscribe) {
        return;
      }
      if (mapStateToProps) {
        const nextState = mapStateToProps(getClientStore().getState() as any);
        const prevState = getPrevData(nextState, this.data);
        const updateData = diffData(prevState, nextState);
        updateData && this.setData(diffData);
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
    const mergeConfig: C = {
      ...config,
      ...(mapDispatchToProps ? mapDispatchToProps(getClientStore()!.dispatch as any) : {}),
      onLoad,
      onUnload,
      onShow,
      onHide,
    };

    return mergeConfig as any;
  };
}

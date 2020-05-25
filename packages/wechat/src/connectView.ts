import {MapDispatchToProps, MapStateToProps, Props, diffData, getPrevData} from './utils';
import {getClientStore, loadModel} from '@medux/core';

import {Unsubscribe} from 'redux';

export type ComponentConfigWithInjected<TInjectedProps, TInjectedMethods> = <C extends meduxCore.ComponentConfig>(config: C) => C & {data: TInjectedProps; methods: TInjectedMethods};

export function connectView<TInjectedProps = Props, TInjectedMethods = Props, TOwnProps = Props, TState = Props>(
  moduleName: string,
  mapStateToProps?: MapStateToProps<TInjectedProps, TOwnProps, TState>,
  mapDispatchToProps?: MapDispatchToProps<TInjectedMethods, TOwnProps>
): ComponentConfigWithInjected<TInjectedProps, TInjectedMethods> {
  return <C extends meduxCore.ComponentConfig>(config: C) => {
    let unsubscribe: Unsubscribe | undefined;
    let ready = false;

    function onStateChange(this: meduxCore.ComponentConfig): void {
      if (!unsubscribe) {
        return;
      }
      if (mapStateToProps) {
        const nextState = mapStateToProps(getClientStore().getState() as any);
        const prevState = getPrevData(nextState, this.data || {});
        const updateData = diffData(prevState, nextState);
        updateData && this.setData!(diffData);
      }
    }
    // function created(this: ComponentConfig): void {
    //   //loadModel(moduleName);
    //   config.lifetimes?.created?.call(this);
    // }
    function attached(this: meduxCore.ComponentConfig): void {
      loadModel(moduleName);
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
    const mergeConfig: C = {
      ...config,
      methods: {
        ...config.methods,
        ...(mapDispatchToProps && mapDispatchToProps(getClientStore().dispatch as any)),
      },
      lifetimes: {
        ...config.lifetimes,
        //created,
        attached,
        detached,
      },
      pageLifetimes: {
        ...config.pageLifetimes,
        show,
        hide,
      },
    };
    return mergeConfig as any;
  };
}

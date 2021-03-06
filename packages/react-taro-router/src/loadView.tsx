import React, {ComponentType, Component} from 'react';
import {RootModuleFacade, getView, isPromise, env} from '@medux/core';
import type {BaseLoadView} from '@medux/core';
import {View} from '@tarojs/components';

export type LoadView<A extends RootModuleFacade = {}> = BaseLoadView<A, {OnError?: ComponentType<{message: string}>; OnLoading?: ComponentType<{}>}>;

const loadViewDefaultOptions: {LoadViewOnError: ComponentType<{message: string}>; LoadViewOnLoading: ComponentType<{}>} = {
  LoadViewOnError: ({message}) => <View className="g-view-error">{message}</View>,
  LoadViewOnLoading: () => <View className="g-view-loading">loading...</View>,
};
export function setLoadViewOptions({
  LoadViewOnError,
  LoadViewOnLoading,
}: {
  LoadViewOnError?: ComponentType<{message: string}>;
  LoadViewOnLoading?: ComponentType<{}>;
}) {
  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
}
export const loadView: LoadView = (moduleName, viewName, options) => {
  const {OnLoading, OnError} = options || {};
  class Loader extends Component<{forwardedRef: any}> {
    private active: boolean = true;

    private loading: boolean = false;

    private error: string = '';

    private view?: ComponentType<any>;

    state = {
      ver: 0,
    };

    constructor(props: any) {
      super(props);
      this.execute();
    }

    componentWillUnmount() {
      this.active = false;
    }

    shouldComponentUpdate() {
      this.execute();
      return true;
    }

    componentDidMount() {
      this.error = '';
    }

    execute() {
      if (!this.view && !this.loading && !this.error) {
        this.loading = true;
        let result: ComponentType<any> | Promise<ComponentType<any>> | undefined;
        try {
          result = getView<ComponentType<any>>(moduleName, viewName);
        } catch (e: any) {
          this.loading = false;
          this.error = e.message || `${e}`;
        }
        if (result) {
          if (isPromise(result)) {
            result.then(
              (view) => {
                this.loading = false;
                this.view = view;
                this.active && this.setState({ver: this.state.ver + 1});
              },
              (e) => {
                env.console.error(e);
                this.loading = false;
                this.error = e.message || `${e}` || 'error';
                this.active && this.setState({ver: this.state.ver + 1});
              }
            );
          } else {
            this.loading = false;
            this.view = result;
          }
        }
      }
    }

    render() {
      const {forwardedRef, ...rest} = this.props;

      if (this.view) {
        return <this.view ref={forwardedRef} {...rest} />;
      }
      if (this.loading) {
        const Comp = OnLoading || loadViewDefaultOptions.LoadViewOnLoading;
        return <Comp />;
      }
      const Comp = OnError || loadViewDefaultOptions.LoadViewOnError;
      return <Comp message={this.error} />;
    }
  }
  return React.forwardRef((props, ref) => {
    return <Loader {...props} forwardedRef={ref} />;
  }) as any;
};

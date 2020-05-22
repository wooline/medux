import { MapDispatchToProps, MapStateToProps, Props } from './utils';
export declare type PageConfigWithInjected<TInjectedProps, TInjectedMethods> = <C extends meduxCore.PageConfig>(config: C) => C & TInjectedMethods & {
    data: TInjectedProps;
};
export declare function connectPage<TInjectedProps = Props, TInjectedMethods = Props, TOwnProps = Props, TState = Props>(moduleName: string, mapStateToProps?: MapStateToProps<TInjectedProps, TOwnProps, TState>, mapDispatchToProps?: MapDispatchToProps<TInjectedMethods, TOwnProps>): PageConfigWithInjected<TInjectedProps, TInjectedMethods>;

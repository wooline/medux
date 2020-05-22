import { MapDispatchToProps, MapStateToProps, Props } from './utils';
import { PageConfig } from './env';
export declare type PageConfigWithInjected<TInjectedProps, TInjectedMethods> = <C extends PageConfig>(config: C) => C & TInjectedMethods & {
    data: TInjectedProps;
};
export declare function connectPage<TInjectedProps = Props, TInjectedMethods = Props, TOwnProps = Props, TState = Props>(moduleName: string, mapStateToProps?: MapStateToProps<TInjectedProps, TOwnProps, TState>, mapDispatchToProps?: MapDispatchToProps<TInjectedMethods, TOwnProps>): PageConfigWithInjected<TInjectedProps, TInjectedMethods>;

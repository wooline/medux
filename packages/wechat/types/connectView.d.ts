import { MapDispatchToProps, MapStateToProps, Props } from './utils';
export declare type ComponentConfigWithInjected<TInjectedProps, TInjectedMethods> = <C extends meduxCore.ComponentConfig>(config: C) => C & {
    data: TInjectedProps;
    methods: TInjectedMethods;
};
export declare function connectView<TInjectedProps = Props, TInjectedMethods = Props, TOwnProps = Props, TState = Props>(moduleName: string, mapStateToProps?: MapStateToProps<TInjectedProps, TOwnProps, TState>, mapDispatchToProps?: MapDispatchToProps<TInjectedMethods, TOwnProps>): ComponentConfigWithInjected<TInjectedProps, TInjectedMethods>;

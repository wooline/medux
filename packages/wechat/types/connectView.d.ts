import { MapDispatchToProps, MapStateToProps, Props } from './utils';
import { ComponentConfig } from './env';
export declare type ComponentConfigWithInjected<TInjectedProps, TInjectedMethods> = <C extends ComponentConfig>(config: C) => C & {
    data: TInjectedProps;
    methods: TInjectedMethods;
};
export declare function connectView<TInjectedProps = Props, TInjectedMethods = Props, TOwnProps = Props, TState = Props>(moduleName: string, mapStateToProps?: MapStateToProps<TInjectedProps, TOwnProps, TState>, mapDispatchToProps?: MapDispatchToProps<TInjectedMethods, TOwnProps>): ComponentConfigWithInjected<TInjectedProps, TInjectedMethods>;

import { Store, StoreEnhancer, Middleware } from 'redux';
import { CommonModule, ModuleGetter } from '../basic';
import { CreateApp } from '../render';
import { ActionDecorator } from '../store';
interface ReduxOptions {
    actionDecorator?: ActionDecorator;
    initState?: any;
    enhancers?: StoreEnhancer[];
    middlewares?: Middleware[];
}
declare type CreateAppWithRedux<RO, V> = (render: (store: Store, appView: V, renderOptions: RO) => (appView: V) => void, ssr: (store: Store, appView: V, renderOptions: RO) => {
    html: string;
    data: any;
}, preModules: string[], moduleGetter: ModuleGetter, appModuleOrName: string | CommonModule, appViewName: string) => ReturnType<CreateApp<ReduxOptions, Store, RO, V>>;
export declare const createAppWithRedux: CreateAppWithRedux<any, any>;
export {};

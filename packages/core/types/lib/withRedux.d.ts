import { Unsubscribe, StoreEnhancer } from 'redux';
import { CommonModule, ModuleGetter } from '../basic';
import { BaseStore, BaseStoreOptions, CreateApp } from '../render';
import { ControllerMiddleware } from '../store';
export interface ReduxOptions extends BaseStoreOptions {
    middlewares?: ControllerMiddleware[];
    enhancers?: StoreEnhancer[];
    initState?: any;
}
export interface ReduxStore extends BaseStore {
    subscribe(listener: () => void): Unsubscribe;
}
declare type CreateAppWithRedux<RO, V> = (render: (store: ReduxStore, appView: V, renderOptions: RO) => (appView: V) => void, ssr: (store: ReduxStore, appView: V, renderOptions: RO) => {
    html: string;
    data: any;
}, preModules: string[], moduleGetter: ModuleGetter, appModuleOrName: string | CommonModule, appViewName: string) => ReturnType<CreateApp<ReduxOptions, ReduxStore, RO, V>>;
export declare const createAppWithRedux: CreateAppWithRedux<any, any>;
export {};

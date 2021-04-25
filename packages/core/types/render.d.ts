import { CommonModule, ModuleGetter, IController } from './basic';
import { ControllerMiddleware, Dispatch, GetState } from './store';
export declare function viewHotReplacement(moduleName: string, views: {
    [key: string]: any;
}): void;
export interface BaseStoreOptions {
    middlewares?: ControllerMiddleware[];
    initData?: any;
}
export interface BaseStore {
    dispatch: Dispatch;
    getState: GetState;
}
export declare type CreateApp<SO extends BaseStoreOptions = BaseStoreOptions, ST extends BaseStore = BaseStore, RO = any, V = any> = (storeCreator: (controller: IController, storeOptions: SO) => ST, render: (store: ST, appView: V, renderOptions: RO) => (appView: V) => void, ssr: (store: ST, appView: V, renderOptions: RO) => {
    html: string;
    data: any;
}, preModules: string[], moduleGetter: ModuleGetter, appModuleOrName?: string | CommonModule, appViewName?: string) => {
    useStore: (storeOptions: SO) => {
        store: ST;
        render: (renderOptions: RO) => Promise<void>;
        ssr: (renderOptions: RO) => Promise<{
            html: string;
            data: any;
        }>;
    };
};
export declare const createApp: CreateApp;

import { ModuleGetter, BStore, IStore } from './basic';
import { ControllerMiddleware } from './store';
export declare function viewHotReplacement(moduleName: string, views: {
    [key: string]: any;
}): void;
export declare function renderApp<ST extends BStore = BStore>(baseStore: ST, preLoadModules: string[], moduleGetter: ModuleGetter, middlewares?: ControllerMiddleware[], appModuleName?: string, appViewName?: string): {
    store: IStore<any> & ST;
    beforeRender(): Promise<{
        appView: any;
        setReRender(hotRender: (appView: any) => void): void;
    }>;
};
export declare function ssrApp<ST extends BStore = BStore>(baseStore: ST, preLoadModules: string[], moduleGetter: ModuleGetter, middlewares?: ControllerMiddleware[], appModuleName?: string, appViewName?: string): {
    store: IStore<any> & ST;
    beforeRender(): Promise<{
        appView: any;
    }>;
};

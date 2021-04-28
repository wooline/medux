import { ModuleGetter, IStore } from './basic';
import { ControllerMiddleware } from './store';
export declare function viewHotReplacement(moduleName: string, views: {
    [key: string]: any;
}): void;
export declare function renderApp<ST extends IStore = IStore>(store: ST, preLoadModules: string[], moduleGetter: ModuleGetter, middlewares?: ControllerMiddleware[], appModuleName?: string, appViewName?: string): () => Promise<{
    appView: any;
    setReRender(hotRender: (appView: any) => void): void;
}>;
export declare function ssrApp<ST extends IStore = IStore, V = any>(ssr: (appView: V) => string, store: ST, preLoadModules: string[], moduleGetter: ModuleGetter, middlewares?: ControllerMiddleware[], appModuleName?: string, appViewName?: string): () => Promise<{
    appView: any;
}>;

import { RootState as BaseRootState, ExportGlobals, ExportModule, LoadView, ModuleGetter, StoreOptions } from '@medux/core/types/export';
import { RouterState } from 'connected-react-router';
import { ComponentType, ReactElement } from 'react';
export declare type RouterParser<T = any> = (nextRouter: T, prevRouter?: T) => T;
export declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, storeOptions?: StoreOptions & {
    routerParser?: RouterParser;
}, container?: string | Element | ((component: ReactElement<any>) => void)): Promise<void>;
export declare function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, initialEntries: string[], storeOptions?: StoreOptions & {
    routerParser?: RouterParser;
}, renderToStream?: boolean): Promise<{
    html: string | ReadableStream;
    data: any;
    ssrInitStoreKey: string;
}>;
export declare const loadView: LoadView;
export declare const exportModule: ExportModule<ComponentType<any>>;
export declare const exportGlobals: ExportGlobals<{
    router: RouterState;
}>;
export declare type RootState<G extends ModuleGetter = {}, R = RouterState> = BaseRootState<G> & {
    router: R;
};

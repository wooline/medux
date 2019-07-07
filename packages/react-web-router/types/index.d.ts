import { RootState as BaseRootState, ModuleGetter, StoreOptions } from '@medux/core/types/export';
import { BrowserHistoryOptions, BrowserLocation, HistoryActions, MemoryHistoryOptions } from '@medux/web';
import { ReactElement } from 'react';
export { loadView, exportModule } from '@medux/react';
export declare let historyActions: HistoryActions;
export declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, historyOptions: BrowserHistoryOptions, storeOptions?: StoreOptions, container?: string | Element | ((component: ReactElement<any>) => void)): Promise<void>;
export declare function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, historyOptions: MemoryHistoryOptions, storeOptions?: StoreOptions, renderToStream?: boolean): Promise<{
    html: string | ReadableStream;
    data: any;
    ssrInitStoreKey: string;
}>;
export declare type RootState<G extends ModuleGetter> = BaseRootState<G, BrowserLocation>;

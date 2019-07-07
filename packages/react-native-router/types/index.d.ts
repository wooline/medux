import { RootState as BaseRootState, ModuleGetter, StoreOptions } from '@medux/core/types/export';
export { loadView, exportModule } from '@medux/react';
export declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(appName: string, moduleGetter: M, appModuleName: A, storeOptions?: StoreOptions): Promise<void>;
export declare type RootState<G extends ModuleGetter> = BaseRootState<G>;

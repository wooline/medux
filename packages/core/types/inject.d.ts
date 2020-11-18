import { Action, ActionHandler, CoreModuleState, CommonModule, ModuleModel, ModuleGetter, ModelStore } from './basic';
export interface ActionHandlerList {
    [actionName: string]: ActionHandler;
}
export declare function cacheModule<T extends CommonModule>(module: T): () => T;
export declare function getClientStore(): ModelStore;
export declare function injectActions(store: ModelStore, moduleName: string, handlers: ActionHandlerList): import("./basic").ActionCreatorList;
declare type Handler<F> = F extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
export declare type Actions<Ins> = {
    [K in keyof Ins]: Ins[K] extends (...args: any[]) => any ? Handler<Ins[K]> : never;
};
export declare function loadModel<MG extends ModuleGetter>(moduleName: Extract<keyof MG, string>, store: ModelStore): void | Promise<void>;
export declare abstract class CoreModuleHandlers<N extends string = any, S extends CoreModuleState = any> {
    readonly moduleName: N;
    readonly initState: S;
    protected readonly actions: Actions<this>;
    protected readonly store: ModelStore;
    constructor(moduleName: N, initState: S);
    protected get state(): S;
    protected getState(): S;
    protected get rootState(): unknown;
    protected getRootState<R>(): R;
    protected get currentState(): S;
    protected getCurrentState(): S;
    protected get currentRootState(): unknown;
    protected getCurrentRootState<R>(): R;
    protected get prevState(): undefined | S;
    protected getPrevState(): undefined | S;
    protected get prevRootState(): unknown;
    protected getPrevRootState<R>(): R;
    protected dispatch(action: Action): Action | Promise<void>;
    protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {
        type: string;
        payload?: any[];
    };
    protected updateState(payload: Partial<S>, key: string): void;
    protected loadModel(moduleName: string): void | Promise<void>;
    protected Init(initState: S): S;
    protected Update(payload: S, key: string): S;
    protected Loading(payload: {
        [group: string]: string;
    }): S;
}
export interface Module<H extends CoreModuleHandlers = CoreModuleHandlers, VS extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> {
    default: {
        moduleName: H['moduleName'];
        initState: H['initState'];
        model: ModuleModel;
        views: VS;
        actions: Actions<H>;
    };
}
export declare type ExportModule<Component> = <V extends {
    [key: string]: Component;
}, T extends CoreModuleHandlers>(ModuleHandles: {
    new (): T;
}, views: V) => Module<T, V>['default'];
export declare const exportModule: ExportModule<any>;
export declare function getView<T>(moduleName: string, viewName: string): T | Promise<T>;
export declare function getModuleByName(moduleName: string, moduleGetter: ModuleGetter): Promise<Module> | Module;
export {};

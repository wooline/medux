import { Action, ActionHandler, CoreModuleState, CoreRootState, Module, ModuleModel, ModuleGetter, ModelStore } from './basic';
export interface ActionHandlerList {
    [actionName: string]: ActionHandler;
}
export interface CommonModule {
    default: {
        moduleName: string;
        model: {
            moduleName: string;
            initState: any;
            (store: any, options?: any): void | Promise<void>;
        };
        views: {
            [key: string]: any;
        };
        actions: {
            [actionName: string]: (...args: any[]) => Action;
        };
    };
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
export declare abstract class CoreModelHandlers<S extends CoreModuleState, R extends CoreRootState> {
    protected readonly moduleName: string;
    protected readonly store: ModelStore;
    protected readonly actions: Actions<this>;
    constructor(moduleName: string, store: ModelStore);
    protected get state(): S;
    protected getState(): S;
    protected get rootState(): R;
    protected getRootState(): R;
    protected get currentState(): S;
    protected getCurrentState(): S;
    protected get currentRootState(): R;
    protected getCurrentRootState(): R;
    protected get prevState(): undefined | S;
    protected getPrevState(): undefined | S;
    protected get prevRootState(): R;
    protected getPrevRootState(): R;
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
export declare type ExportModule<Component> = <S extends CoreModuleState, V extends {
    [key: string]: Component;
}, T extends CoreModelHandlers<S, any>, N extends string>(moduleName: N, initState: S, ActionHandles: {
    new (moduleName: string, store: any): T;
}, views: V) => Module<ModuleModel<S>, V, Actions<T>, N>['default'];
export declare const exportModule: ExportModule<any>;
export declare function getView<T>(moduleName: string, viewName: string): T | Promise<T>;
export declare function getModuleByName(moduleName: string, moduleGetter: ModuleGetter): Promise<Module> | Module;
export {};

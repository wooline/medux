import { Action, ActionHandlerList, CoreModuleState, CommonModule, ModuleModel, ModuleGetter, ModuleStore } from './basic';
export declare function cacheModule<T extends CommonModule>(module: T): () => T;
export declare function getClientStore(): ModuleStore;
export declare function injectActions(store: ModuleStore, moduleName: string, handlers: ActionHandlerList): void;
declare type Handler<F> = F extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
export declare type Actions<Ins> = {
    [K in keyof Ins]: Ins[K] extends (...args: any) => any ? Handler<Ins[K]> : never;
};
export declare function loadModel<MG extends ModuleGetter>(moduleName: Extract<keyof MG, string>, store: ModuleStore): void | Promise<void>;
export declare abstract class CoreModuleHandlers<S extends CoreModuleState = CoreModuleState, R extends Record<string, any> = {}> {
    readonly initState: S;
    protected actions: Actions<this>;
    protected store: ModuleStore;
    protected moduleName: string;
    constructor(initState: S);
    protected get state(): S;
    protected get rootState(): R;
    protected get currentState(): S;
    protected get currentRootState(): R;
    protected get prevState(): undefined | S;
    protected get prevRootState(): R;
    protected dispatch(action: Action): Action | Promise<void>;
    protected loadModel(moduleName: string): void | Promise<void>;
    Init(initState: S): S;
    Update(payload: Partial<S>, key: string): S;
    Loading(payload: {
        [group: string]: string;
    }): S;
}
export interface Module<N extends string = string, H extends CoreModuleHandlers = CoreModuleHandlers, VS extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> {
    default: {
        moduleName: N;
        model: ModuleModel;
        initState: H['initState'];
        views: VS;
        actions: Actions<H>;
    };
}
export declare type ExportModule<Component> = <N extends string, V extends {
    [key: string]: Component;
}, H extends CoreModuleHandlers>(moduleName: N, ModuleHandles: {
    new (): H;
}, views: V) => Module<N, H, V>['default'];
export declare const exportModule: ExportModule<any>;
export declare function getView<T>(moduleName: string, viewName: string): T | Promise<T>;
export declare function getModuleByName(moduleName: string, moduleGetter: ModuleGetter): Promise<Module> | Module;
export {};

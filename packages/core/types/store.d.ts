import { Action, ActionHandler, IController, IStore, IStoreOptions, IModuleHandlers, Dispatch, GetState, State } from './basic';
export declare function isProcessedError(error: any): boolean;
export declare function setProcessedError(error: any, meduxProcessed: boolean): {
    __meduxProcessed__: boolean;
    [key: string]: any;
};
export declare function getActionData(action: Action): any[];
export declare type ControllerMiddleware = (api: {
    getState: GetState;
    dispatch: Dispatch;
}) => (next: Dispatch) => (action: Action) => void | Promise<void>;
export declare class Controller<S extends State> implements IController<S> {
    protected middlewares?: ControllerMiddleware[] | undefined;
    store: IStore<S>;
    prevData: {
        actionName: string;
        prevState: S;
    };
    injectedModules: {
        [moduleName: string]: IModuleHandlers;
    };
    constructor(middlewares?: ControllerMiddleware[] | undefined);
    dispatch: Dispatch;
    getState: GetState<S>;
    preMiddleware: ControllerMiddleware;
    setStore(store: IStore<S>): void;
    respondHandler(action: Action, isReducer: boolean, prevData: {
        actionName: string;
        prevState: S;
    }): void | Promise<void>;
    applyEffect(moduleName: string, handler: ActionHandler, modelInstance: IModuleHandlers, action: Action, actionData: any[]): Promise<any>;
    _dispatch(action: Action): void | Promise<void>;
}
export interface StoreBuilder<O extends IStoreOptions = IStoreOptions, T extends IStore = IStore> {
    storeOptions: O;
    storeCreator: (options: O) => T;
}

import { Action, ActionHandler, IController, IStore, IModuleHandlers } from './basic';
export declare function isProcessedError(error: any): boolean;
export declare function setProcessedError(error: any, meduxProcessed: boolean): {
    __meduxProcessed__: boolean;
    [key: string]: any;
};
export declare function getActionData(action: Action): any[];
export declare function snapshotData(data: any): any;
export declare type ActionDecorator = (action: Action) => Action;
export declare class Controller<S extends {
    [key: string]: any;
}> implements IController<S> {
    protected actionDecorator?: ActionDecorator | undefined;
    store: IStore<S>;
    state: S;
    prevData: {
        actionName: string;
        prevState: S;
    };
    injectedModules: {
        [moduleName: string]: IModuleHandlers;
    };
    constructor(actionDecorator?: ActionDecorator | undefined);
    setStore(store: IStore<S>): void;
    respondHandler(action: Action, isReducer: boolean, prevData: {
        actionName: string;
        prevState: S;
    }): void | Promise<void>;
    applyEffect(moduleName: string, handler: ActionHandler, modelInstance: IModuleHandlers, action: Action, actionData: any[]): Promise<any>;
    dispatch(action: Action): void | Promise<void>;
    executeAction(action: Action): void | Promise<void>;
}

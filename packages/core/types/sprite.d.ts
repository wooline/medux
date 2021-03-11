export declare const TaskCountEvent = "TaskCountEvent";
export declare enum LoadingState {
    Start = "Start",
    Stop = "Stop",
    Depth = "Depth"
}
export declare class PEvent<N extends string, D> {
    readonly name: N;
    readonly data: D;
    bubbling: boolean;
    readonly target: PDispatcher;
    readonly currentTarget: PDispatcher;
    constructor(name: N, data: D, bubbling?: boolean);
    setTarget(target: PDispatcher): void;
    setCurrentTarget(target: PDispatcher): void;
}
export declare class PDispatcher<T extends {
    [key: string]: any;
} = {}> {
    readonly parent?: PDispatcher<{}> | undefined;
    protected readonly storeHandlers: {
        [N in keyof T]?: Array<(e: PEvent<Extract<N, string>, T[N]>) => void>;
    };
    constructor(parent?: PDispatcher<{}> | undefined);
    addListener<N extends keyof T>(ename: N, handler: (e: PEvent<Extract<N, string>, T[N]>) => void): this;
    removeListener<N extends keyof T>(ename?: N, handler?: (e: PEvent<Extract<N, string>, T[N]>) => void): this;
    dispatch<N extends keyof T>(evt: PEvent<Extract<N, string>, T[N]>): this;
    setParent(parent?: PDispatcher): this;
}
export declare class TaskCounter extends PDispatcher<{
    TaskCountEvent: LoadingState;
}> {
    deferSecond: number;
    readonly list: {
        promise: Promise<any>;
        note: string;
    }[];
    private ctimer;
    constructor(deferSecond: number);
    addItem(promise: Promise<any>, note?: string): Promise<any>;
    private completeItem;
}
export declare function isPlainObject(obj: any): boolean;
export declare function deepMerge(target: {
    [key: string]: any;
}, ...args: any[]): any;

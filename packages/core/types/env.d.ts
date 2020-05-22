export interface ENV {
    setTimeout: (callback: () => void, time: number) => number;
    clearTimeout: (timer: number) => void;
    console: {
        log: (msg: string) => void;
        warn: (msg: string) => void;
    };
}
export interface Client {
    __REDUX_DEVTOOLS_EXTENSION__?: (options: any) => any;
    __REDUX_DEVTOOLS_EXTENSION__OPTIONS?: any;
}
export declare const env: ENV;
export declare const isServerEnv: boolean;
export declare const client: Client | undefined;
export declare const isDevelopmentEnv: boolean;

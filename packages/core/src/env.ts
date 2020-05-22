/* global self,process,global,window */
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

// @ts-ignore
export const env: ENV = (typeof self == 'object' && self.self === self && self) || (typeof global == 'object' && global.global === global && global) || this;
// @ts-ignore
export const isServerEnv: boolean = typeof global !== 'undefined' && typeof window === 'undefined';
// @ts-ignore
export const client: Client | undefined = (isServerEnv ? undefined : typeof window === 'undefined' ? global : window) as any;
// @ts-ignore
export const isDevelopmentEnv: boolean = process.env.NODE_ENV !== 'production';

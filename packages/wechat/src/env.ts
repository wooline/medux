import {env as coreEnv} from '@medux/core';

interface GeneralCallbackResult {
  errMsg: string;
}
type RouteCallback = (res: GeneralCallbackResult) => void;

export interface RouteOption {
  url: string;
  complete?: RouteCallback;
  fail?: RouteCallback;
  success?: RouteCallback;
}
export interface NavigateBackOption {
  delta?: number;
  complete?: RouteCallback;
  fail?: RouteCallback;
  success?: RouteCallback;
}
interface WX {
  getLaunchOptionsSync(): {path: string; query: {[key: string]: string}};
  switchTab(option: RouteOption): void;
  reLaunch(option: RouteOption): void;
  redirectTo(option: RouteOption): void;
  navigateTo(option: RouteOption): void;
  navigateBack(option: NavigateBackOption): void;
}

type Props = {[key: string]: any};
export interface ComponentConfig {
  properties?: {[prop: string]: any};
  data: Props;
  lifetimes?: {
    created?(): void;
    attached?(): void;
    detached?(): void;
  };
  pageLifetimes?: {
    show?(): void;
    hide?(): void;
  };
  methods?: {[method: string]: Function};
  setData(data: Props): void;
}
export interface PageConfig {
  data: Props;
  setData(data: Props): void;
  onLoad?(options: any): void;
  onUnload?(): void;
  onShow?(): void;
  onHide?(): void;
}

interface Env {
  wx: WX;
  getCurrentPages: () => Array<{route: string; options: {[key: string]: string}}>;
  console: {warn: (msg: string) => void; log: (msg: string) => void};
}
export const env: Env = coreEnv as any;

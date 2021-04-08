import {env} from './env';

/**
 * Loading状态，可通过effect注入，也可通过setLoading注入
 * 同一时段同一分组的多个loading状态会自动合并
 */
export enum LoadingState {
  /**
   * 开始加载.
   */
  Start = 'Start',
  /**
   * 加载完成.
   */
  Stop = 'Stop',
  /**
   * 开始深度加载，对于加载时间超过setLoadingDepthTime设置值时将转为深度加载状态
   */
  Depth = 'Depth',
}

export class SingleDispatcher<T> {
  protected listenerId: number = 0;

  protected readonly listenerMap: {[id: string]: (data: T) => void} = {};

  addListener(callback: (data: T) => void) {
    this.listenerId++;
    const id = `${this.listenerId}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch(data: T) {
    const listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach((id) => {
      listenerMap[id](data);
    });
  }
}

export class MultipleDispatcher<T extends {[key: string]: any} = {}> {
  protected listenerId: number = 0;

  protected listenerMap: {[N in keyof T]?: {[id: string]: (data: T[N]) => void}} = {};

  addListener<N extends keyof T>(name: N, callback: (data: T[N]) => void) {
    this.listenerId++;
    const id = `${this.listenerId}`;
    if (!this.listenerMap[name]) {
      this.listenerMap[name] = {};
    }
    const listenerMap = this.listenerMap[name] as {[id: string]: (data: T[N]) => void};
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch<N extends keyof T>(name: N, data: T[N]) {
    const listenerMap = this.listenerMap[name] as {[id: string]: (data: T[N]) => void};
    if (listenerMap) {
      Object.keys(listenerMap).forEach((id) => {
        listenerMap[id](data);
      });
    }
  }
}

// export class PEvent<N extends string, D> {
//   public readonly target!: PDispatcher;

//   public readonly currentTarget!: PDispatcher;

//   public constructor(public readonly name: N, public readonly data: D, public bubbling: boolean = false) {}

//   public setTarget(target: PDispatcher) {
//     (this as any).target = target;
//   }

//   public setCurrentTarget(target: PDispatcher) {
//     (this as any).currentTarget = target;
//   }
// }

// export class PDispatcher<T extends {[key: string]: any} = {}> {
//   protected readonly storeHandlers: {[N in keyof T]?: Array<(e: PEvent<Extract<N, string>, T[N]>) => void>} = {};

//   public constructor(public readonly parent?: PDispatcher) {}

//   public addListener<N extends keyof T>(ename: N, handler: (e: PEvent<Extract<N, string>, T[N]>) => void): this {
//     let dictionary = this.storeHandlers[ename];
//     if (!dictionary) {
//       // eslint-disable-next-line no-multi-assign
//       this.storeHandlers[ename] = dictionary = [];
//     }
//     dictionary.push(handler);
//     return this;
//   }

//   public removeListener<N extends keyof T>(ename?: N, handler?: (e: PEvent<Extract<N, string>, T[N]>) => void): this {
//     if (!ename) {
//       Object.keys(this.storeHandlers).forEach((key) => {
//         delete this.storeHandlers[key];
//       });
//     } else {
//       const handlers = this.storeHandlers;
//       const dictionary = handlers[ename];
//       if (dictionary) {
//         if (!handler) {
//           delete handlers[ename];
//         } else {
//           const n = dictionary.indexOf(handler);
//           if (n > -1) {
//             dictionary.splice(n, 1);
//           }
//           if (dictionary.length === 0) {
//             delete handlers[ename];
//           }
//         }
//       }
//     }
//     return this;
//   }

//   public dispatch<N extends keyof T>(evt: PEvent<Extract<N, string>, T[N]>): this {
//     if (!evt.target) {
//       evt.setTarget(this);
//     }
//     evt.setCurrentTarget(this);
//     const dictionary = this.storeHandlers[evt.name];
//     if (dictionary) {
//       for (let i = 0, k = dictionary.length; i < k; i++) {
//         dictionary[i](evt as any);
//       }
//     }
//     if (this.parent && evt.bubbling) {
//       this.parent.dispatch(evt as any);
//     }
//     return this;
//   }

//   public setParent(parent?: PDispatcher): this {
//     (this as any).parent = parent;
//     return this;
//   }
// }

export class TaskCounter extends SingleDispatcher<LoadingState> {
  public readonly list: {promise: Promise<any>; note: string}[] = [];

  private ctimer: number = 0;

  public constructor(public deferSecond: number) {
    super();
  }

  public addItem(promise: Promise<any>, note = ''): Promise<any> {
    if (!this.list.some((item) => item.promise === promise)) {
      this.list.push({promise, note});
      promise.finally(() => this.completeItem(promise));

      if (this.list.length === 1 && !this.ctimer) {
        this.dispatch(LoadingState.Start);
        this.ctimer = env.setTimeout(() => {
          this.ctimer = 0;
          if (this.list.length > 0) {
            this.dispatch(LoadingState.Depth);
          }
        }, this.deferSecond * 1000);
      }
    }
    return promise;
  }

  private completeItem(promise: Promise<any>): this {
    const i = this.list.findIndex((item) => item.promise === promise);
    if (i > -1) {
      this.list.splice(i, 1);
      if (this.list.length === 0) {
        if (this.ctimer) {
          env.clearTimeout.call(null, this.ctimer);
          this.ctimer = 0;
        }
        this.dispatch(LoadingState.Stop);
      }
    }
    return this;
  }
}

// export class TaskCounter extends PDispatcher<{TaskCountEvent: LoadingState}> {
//   public readonly list: {promise: Promise<any>; note: string}[] = [];

//   private ctimer: number | null = null;

//   public constructor(public deferSecond: number) {
//     super();
//   }

//   public addItem(promise: Promise<any>, note = ''): Promise<any> {
//     if (!this.list.some((item) => item.promise === promise)) {
//       this.list.push({promise, note});
//       promise.then(
//         () => this.completeItem(promise),
//         () => this.completeItem(promise)
//       );

//       if (this.list.length === 1) {
//         this.dispatch(new PEvent(TaskCountEvent, LoadingState.Start));
//         this.ctimer = env.setTimeout(() => {
//           this.ctimer = null;
//           if (this.list.length > 0) {
//             this.dispatch(new PEvent(TaskCountEvent, LoadingState.Depth));
//           }
//         }, this.deferSecond * 1000);
//       }
//     }
//     return promise;
//   }

//   private completeItem(promise: Promise<any>): this {
//     const i = this.list.findIndex((item) => item.promise === promise);
//     if (i > -1) {
//       this.list.splice(i, 1);
//       if (this.list.length === 0) {
//         if (this.ctimer) {
//           env.clearTimeout.call(null, this.ctimer);
//           this.ctimer = null;
//         }

//         this.dispatch(new PEvent(TaskCountEvent, LoadingState.Stop));
//       }
//     }
//     return this;
//   }
// }

export function isPlainObject(obj: any) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepMerge(optimize: boolean | null, target: {[key: string]: any}, inject: {[key: string]: any}[]) {
  Object.keys(inject).forEach(function (key) {
    const src = target[key];
    const val = inject[key];
    if (isPlainObject(val)) {
      if (isPlainObject(src)) {
        target[key] = __deepMerge(optimize, src, val);
      } else {
        target[key] = optimize ? val : __deepMerge(optimize, {}, val);
      }
    } else {
      target[key] = val;
    }
  });
  return target;
}

export function deepMerge(target: {[key: string]: any}, ...args: any[]): any {
  if (!isPlainObject(target)) {
    target = {};
  }
  args = args.filter((item) => isPlainObject(item) && Object.keys(item).length);
  if (args.length < 1) {
    return target;
  }
  args.forEach(function (inject, index) {
    if (isPlainObject(inject)) {
      let lastArg = false;
      let last2Arg: any = null;
      if (index === args.length - 1) {
        lastArg = true;
      } else if (index === args.length - 2) {
        last2Arg = args[index + 1];
      }
      Object.keys(inject).forEach(function (key) {
        const src = target[key];
        const val = inject[key];
        if (isPlainObject(val)) {
          if (isPlainObject(src)) {
            target[key] = __deepMerge(lastArg, src, val);
          } else {
            target[key] = lastArg || (last2Arg && !last2Arg[key]) ? val : __deepMerge(lastArg, {}, val);
          }
        } else {
          target[key] = val;
        }
      });
    }
  });
  return target;
}

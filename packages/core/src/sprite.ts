import {env} from './env';
export const TaskCountEvent = 'TaskCountEvent';

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

export class PEvent {
  public readonly target: PDispatcher = null as any;
  public readonly currentTarget: PDispatcher = null as any;

  public constructor(public readonly name: string, public readonly data?: any, public bubbling: boolean = false) {}

  public setTarget(target: PDispatcher) {
    (this as any).target = target;
  }

  public setCurrentTarget(target: PDispatcher) {
    (this as any).currentTarget = target;
  }
}

export class PDispatcher {
  protected readonly storeHandlers: {
    [key: string]: ((e: PEvent) => void)[];
  } = {};

  public constructor(public readonly parent?: PDispatcher | undefined) {}

  public addListener(ename: string, handler: (e: PEvent) => void): this {
    let dictionary = this.storeHandlers[ename];
    if (!dictionary) {
      this.storeHandlers[ename] = dictionary = [];
    }
    dictionary.push(handler);
    return this;
  }

  public removeListener(ename?: string, handler?: (e: PEvent) => void): this {
    if (!ename) {
      Object.keys(this.storeHandlers).forEach((key) => {
        delete this.storeHandlers[key];
      });
    } else {
      const handlers = this.storeHandlers;
      if (handlers.propertyIsEnumerable(ename)) {
        const dictionary = handlers[ename];
        if (!handler) {
          delete handlers[ename];
        } else {
          const n = dictionary.indexOf(handler);
          if (n > -1) {
            dictionary.splice(n, 1);
          }
          if (dictionary.length === 0) {
            delete handlers[ename];
          }
        }
      }
    }
    return this;
  }

  public dispatch(evt: PEvent): this {
    if (!evt.target) {
      evt.setTarget(this);
    }
    evt.setCurrentTarget(this);
    const dictionary = this.storeHandlers[evt.name];
    if (dictionary) {
      for (let i = 0, k = dictionary.length; i < k; i++) {
        dictionary[i](evt);
      }
    }
    if (this.parent && evt.bubbling) {
      this.parent.dispatch(evt);
    }
    return this;
  }
  public setParent(parent?: PDispatcher): this {
    (this as any).parent = parent;
    return this;
  }
}

export class TaskCounter extends PDispatcher {
  public readonly list: {promise: Promise<any>; note: string}[] = [];
  private ctimer: number | null = null;
  public constructor(public deferSecond: number) {
    super();
  }
  public addItem(promise: Promise<any>, note: string = ''): Promise<any> {
    if (!this.list.some((item) => item.promise === promise)) {
      this.list.push({promise, note});
      promise.then(
        () => this.completeItem(promise),
        () => this.completeItem(promise)
      );

      if (this.list.length === 1) {
        this.dispatch(new PEvent(TaskCountEvent, LoadingState.Start));
        this.ctimer = env.setTimeout(() => {
          this.ctimer = null;
          if (this.list.length > 0) {
            this.dispatch(new PEvent(TaskCountEvent, LoadingState.Depth));
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
          this.ctimer = null;
        }

        this.dispatch(new PEvent(TaskCountEvent, LoadingState.Stop));
      }
    }
    return this;
  }
}

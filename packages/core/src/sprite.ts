export function isPlainObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false;

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

export const TaskCountEvent = 'TaskCountEvent';

export enum LoadingState {
  Start = 'Start',
  Stop = 'Stop',
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
      Object.keys(this.storeHandlers).forEach(key => {
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
  private ctimer: number = 0;
  public constructor(public deferSecond: number) {
    super();
  }
  public addItem(promise: Promise<any>, note: string = ''): Promise<any> {
    if (!this.list.some(item => item.promise === promise)) {
      this.list.push({promise, note});
      promise.then(() => this.completeItem(promise), () => this.completeItem(promise));

      if (this.list.length === 1) {
        this.dispatch(new PEvent(TaskCountEvent, LoadingState.Start));
        this.ctimer = setTimeout(() => {
          this.ctimer = 0;
          if (this.list.length > 0) {
            this.dispatch(new PEvent(TaskCountEvent, LoadingState.Depth));
          }
        }, this.deferSecond * 1000);
      }
    }
    return promise;
  }
  private completeItem(promise: Promise<any>): this {
    const i = this.list.findIndex(item => item.promise === promise);
    if (i > -1) {
      this.list.splice(i, 1);
      if (this.list.length === 0) {
        if (this.ctimer) {
          clearTimeout(this.ctimer);
          this.ctimer = 0;
        }

        this.dispatch(new PEvent(TaskCountEvent, LoadingState.Stop));
      }
    }
    return this;
  }
}

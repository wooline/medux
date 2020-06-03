/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {HistoryProxy, getView, renderApp} from '../index';
import {Middleware, Store} from 'redux';

import {actions} from './modules';
import {moduleGetter} from './modules';

declare const console: any;

const historyProxy: HistoryProxy = {
  initialized: true,
  getLocation() {
    return '127.0.0.1';
  },
  subscribe(listener) {
    return () => void 0;
  },
  locationToRouteData(location) {
    return {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []};
  },
  equal(a, b) {
    return a === b;
  },
  patch(location, routeData) {},
};

describe('无SSR时', () => {
  let mockStore: Store;
  const actionLogs: string[] = [];

  const logerMiddleware: Middleware = ({dispatch}) => (next) => (originalAction) => {
    actionLogs.push(originalAction.type);
    return next(originalAction);
  };

  beforeAll(() => {
    return renderApp<() => void>(
      (store, appModel, appView, ssrKey) => {
        return (appView) => {
          appView();
        };
      },
      moduleGetter,
      'moduleA',
      historyProxy,
      {middlewares: [logerMiddleware], initData: {thirdParty: 123}},
      (store) => {
        mockStore = store;
        return store;
      }
    );
  });
  beforeEach(() => {
    actionLogs.length = 0;
  });
  test('初始状态', () => {
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'message', text: 'text', tips: 'tips'},
    });
  });
  test('加载moduleB.Main,moduleC.Main', async () => {
    const view = await getView<Function>('moduleB', 'Main', {tips: 'tips2'});
    getView<Function>('moduleC', 'Main');
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'message', text: 'text', tips: 'tips'},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'message', text: 'text', tips: 'tips2'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'message', text: 'text', tips: 'tips'},
    });
    expect(view()).toBe('moduleB_views_Main');
  });

  test('moduleA触发reducerAction,moduleB、moduleC监听并触发自己的reducer', () => {
    const consoleLogs: string[] = [];
    const _log = console.log;
    console.log = (...args: any[]) => {
      consoleLogs.push(...args);
    };
    mockStore.dispatch(actions.moduleA.setMessage('message-changed'));
    //rootState尚未发生改变
    expect(consoleLogs[0]).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'message', text: 'text', tips: 'tips'},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'message', text: 'text', tips: 'tips2'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'message', text: 'text', tips: 'tips'},
    });
    //currentRootState改变了moduleB的部分
    expect(consoleLogs[1]).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'message-changed', text: 'text', tips: 'tips'},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'message-changed', text: 'text', tips: 'tips2'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'message', text: 'text', tips: 'tips'},
    });
    //在reducer中，通常prevRootState与rootState相同
    expect(consoleLogs[2]).toBe(consoleLogs[0]);
    //执行全部完成后，rootState已经全部改变
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'message-changed', text: 'text', tips: 'tips'},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'message-changed', text: 'text', tips: 'tips2'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'message-changed', text: 'text', tips: 'tips'},
    });
    console.log = _log;
  });
  test('moduleA触发reducerAction,moduleB、moduleC监听并触发自己的effect', async () => {
    const consoleLogs: string[] = [];
    const _log = console.log;
    console.log = (...args: any[]) => {
      consoleLogs.push(...args);
    };
    const result: any = mockStore.dispatch(actions.moduleA.setText('text-changed'));
    //当action同时有reducer和effect监听时，reducer先执行完毕后才执行effect，所以在effectHandle中rootState已经发生改变
    expect(consoleLogs[0]).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'message-changed', text: 'text-changed', tips: 'tips'},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'message-changed', text: 'text', tips: 'tips2'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'message-changed', text: 'text', tips: 'tips'},
    });
    //在effect中，通常currentRootState与rootState相同
    expect(consoleLogs[1]).toBe(consoleLogs[0]);
    //prevRootState指向未经reducer更改的前状态
    expect(consoleLogs[2]).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'message-changed', text: 'text', tips: 'tips'},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'message-changed', text: 'text', tips: 'tips2'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'message-changed', text: 'text', tips: 'tips'},
    });
    //reducer是同步执行的，effect是异步的，此时reducer已经全部执行完毕，但是effect还未完成，所以loading状态为Start
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'message-changed', text: 'text-changed', tips: 'tips', loading: {global: 'Start'}},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'message-changed', text: 'text-changed', tips: 'tips2'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'message-changed', text: 'text-changed', tips: 'tips'},
    });
    await result;
    //await之后effect已经执行完毕了
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'message-changed', text: 'text-changed', tips: 'tips', loading: {global: 'Stop'}},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'message-changed', text: 'text-changed', tips: 'tips2'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'message-changed', text: 'text-changed', tips: 'tips'},
    });
    expect(actionLogs.join(' ')).toBe(['moduleA.setText', 'moduleB.setText', 'moduleA.Loading', 'moduleC.setText', 'moduleA.Loading'].join(' '));
    console.log = _log;
  });
  test('moduleA触发reducerAction,moduleB、moduleC链式监听', async () => {
    const result: any = mockStore.dispatch(actions.moduleA.setTips('tips-changed'));
    expect(actionLogs.join(' ')).toBe(['moduleA.setTips', 'moduleB.setTips', 'moduleA.Loading', 'moduleC.setTips'].join(' '));
    await result;
    expect(actionLogs.join(' ')).toBe(['moduleA.setTips', 'moduleB.setTips', 'moduleA.Loading', 'moduleC.setTips', 'moduleB.setMessage', 'moduleC.setMessage', 'moduleA.Loading'].join(' '));
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'message-changed', text: 'text-changed', tips: 'tips-changed', loading: {global: 'Stop'}},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'tips-message-changed', text: 'text-changed', tips: 'tips-changed'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'tips-message-changed', text: 'text-changed', tips: 'tips-changed'},
    });
  });
});

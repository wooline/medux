/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {HistoryProxy, getView, isServer, renderApp} from '../index';

import {Store} from 'redux';
import {actions} from './modules';
import {moduleGetter} from './modules';

const historyProxy: HistoryProxy = {
  initialized: true,
  getLocation() {
    return '127.0.0.1';
  },
  subscribe(listener) {},
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
      {initData: {thirdParty: 123}},
      (store) => {
        mockStore = store;
        return store;
      }
    );
  });
  test('初始状态', () => {
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'moduleA-message', tips: 'moduleA-tips'},
    });
  });
  test('加载moduleB.Main,moduleC.Main', async () => {
    const view = await getView<Function>('moduleB', 'Main', {tips: 'moduleB-tips-change'});
    getView<Function>('moduleC', 'Main');
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'moduleA-message', tips: 'moduleA-tips'},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'moduleB-message', tips: 'moduleB-tips-change'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'moduleC-message', tips: 'moduleC-tips'},
    });
    expect(view()).toBe('moduleB_views_Main');
  });

  test('moduleA触发reducerAction,moduleB、moduleC监听并触发自己的reducer', () => {
    mockStore.dispatch(actions.moduleA.setMessage('moduleA-message-changed'));
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'moduleA-message-changed', tips: 'moduleA-tips'},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'moduleA-message-changed', tips: 'moduleB-tips-change'},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'moduleA-message-changed', tips: 'moduleC-tips'},
    });
  });
  test('moduleA触发reducerAction,moduleB、moduleC监听并触发自己的effect', async () => {
    const result: any = mockStore.dispatch(actions.moduleA.setTips('moduleA-tips-changed'));
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'moduleA-message-changed', tips: 'moduleA-tips-changed'},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'moduleA-message-changed', tips: 'moduleB-tips-change-start', loading: {global: 'Start'}},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'moduleA-message-changed', tips: 'moduleC-tips-change-start', loading: {global: 'Start'}},
    });
    await result;
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
      moduleA: {isModule: true, routeParams: {id: 5}, message: 'moduleA-message-changed', tips: 'moduleA-tips-changed'},
      moduleB: {isModule: true, routeParams: {id: 6}, message: 'moduleA-message-changed', tips: 'moduleB-tips-change-end', loading: {global: 'Stop'}},
      moduleC: {isModule: true, routeParams: {id: 7}, message: 'moduleA-message-changed', tips: 'moduleC-tips-change-end', loading: {global: 'Stop'}},
    });
  });
  // test('moduleA触发reducerAction,moduleB、moduleC监听并触发自己的effect', async () => {
  //   const result: any = mockStore.dispatch(actions.moduleA.setCount(99));
  //   expect(mockStore.getState()).toEqual({
  //     thirdParty: 123,
  //     route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
  //     moduleA: {isModule: true, routeParams: {id: 5}, message: 'yes moduleA', count: 99},
  //     moduleB: {isModule: true, routeParams: {id: 6}, message: 'yes moduleA', from: 'moduleA99', loading: {global: 'Start'}},
  //     moduleC: {isModule: true, routeParams: {id: 7}, message: 'listen moduleB/setFrom start', loading: {global: 'Start'}},
  //   });
  //   await result;
  //   expect(mockStore.getState()).toEqual({
  //     thirdParty: 123,
  //     route: {location: '127.0.0.1', data: {views: {}, params: {moduleA: {id: 5}, moduleB: {id: 6}, moduleC: {id: 7}}, paths: [], stackParams: []}},
  //     moduleA: {isModule: true, routeParams: {id: 5}, message: 'yes moduleA', count: 99},
  //     moduleB: {isModule: true, routeParams: {id: 6}, message: 'yes moduleA', from: 'moduleA0', loading: {global: 'Stop'}},
  //     moduleC: {isModule: true, routeParams: {id: 7}, message: 'listen moduleB/setFrom end', loading: {global: 'Stop'}},
  //   });
  // });
});

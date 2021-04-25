import {getView} from 'src/index';
import {createAppWithRedux, ReduxStore} from 'src/lib/withRedux';
import {ControllerMiddleware} from 'src/store';
import {messages} from './utils';
import {App, moduleGetter} from './modules';

describe('init', () => {
  let mockStore: ReduxStore;
  const actionLogs: string[] = [];

  const storeMiddlewares: ControllerMiddleware = () => (next) => (action) => {
    actionLogs.push(action.type);
    return next(action);
  };

  beforeAll(() => {
    const {store, render} = createAppWithRedux(
      () => {
        return () => {};
      },
      () => {
        return {html: '', data: {}};
      },
      [],
      moduleGetter,
      'moduleA',
      'Main'
    ).useStore({middlewares: [storeMiddlewares], initState: {thirdParty: 123}});
    mockStore = store;
    return render({});
  });
  beforeEach(() => {
    actionLogs.length = 0;
    messages.length = 0;
  });
  test('初始状态', () => {
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {initialized: true, count: 0},
    });
  });
  test('加载moduleB.Main,moduleC.Main', async () => {
    const viewB = await getView<Function>('moduleB', 'Main');
    const viewC = await getView<Function>('moduleC', 'Main');
    expect(actionLogs).toEqual(['moduleB.Init', 'moduleC.Init']);
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {initialized: true, count: 0},
      moduleB: {initialized: true, count: 0},
      moduleC: {initialized: true, count: 0},
    });
    expect(viewB()).toBe('moduleB_views_Main');
    expect(viewC()).toBe('moduleC_views_Main');
  });
  test('同步handler', () => {
    mockStore.dispatch(App.moduleA.actions.add());
    expect(actionLogs).toEqual(['moduleA.add', 'moduleB.add', 'moduleA.Loading', 'moduleC.add']);
    expect(messages).toEqual([
      [
        'moduleA/add',
        '{"thirdParty":123,"moduleA":{"count":0,"initialized":true},"moduleB":{"count":0,"initialized":true},"moduleC":{"count":0,"initialized":true}}',
      ],
      [
        'moduleB/moduleA.add',
        '{"thirdParty":123,"moduleA":{"count":1,"initialized":true},"moduleB":{"count":1,"initialized":true},"moduleC":{"count":0,"initialized":true}}',
        '{"thirdParty":123,"moduleA":{"count":0,"initialized":true},"moduleB":{"count":0,"initialized":true},"moduleC":{"count":0,"initialized":true}}',
      ],
      [
        'moduleC/moduleA.add',
        '{"thirdParty":123,"moduleA":{"count":1,"initialized":true,"loading":{"global":"Start"}},"moduleB":{"count":1,"initialized":true},"moduleC":{"count":1,"initialized":true}}',
        '{"thirdParty":123,"moduleA":{"count":0,"initialized":true},"moduleB":{"count":0,"initialized":true},"moduleC":{"count":0,"initialized":true}}',
      ],
    ]);
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {count: 1, initialized: true, loading: {global: 'Start'}},
      moduleB: {count: 1, initialized: true},
      moduleC: {count: 1, initialized: true},
    });
  });
  test('await handler', async () => {
    await mockStore.dispatch(App.moduleA.actions.add());
    expect(actionLogs).toEqual(['moduleA.add', 'moduleB.add', 'moduleA.Loading', 'moduleC.add', 'moduleA.Loading']);
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {count: 2, initialized: true, loading: {global: 'Stop'}},
      moduleB: {count: 2, initialized: true},
      moduleC: {count: 2, initialized: true},
    });
  });
  test('reducerError', () => {
    expect(() => mockStore.dispatch(App.moduleA.actions.reducerError('reducerError'))).toThrow('reducerError');
    expect(actionLogs).toEqual(['moduleA.reducerError']);
  });
  test('effect-reducerError', async () => {
    await mockStore.dispatch(App.moduleA.actions.effectReducerError('reducerError'));
    expect(actionLogs).toEqual(['moduleA.effectReducerError', 'moduleA.reducerError', 'medux.Error']);
  });
});

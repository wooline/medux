import {getView, ModuleGetter, renderApp} from 'src/index';
import {ReduxStore, createRedux} from 'src/lib/with-redux';
import {ControllerMiddleware, StoreBuilder} from 'src/store';
import {IStore, IStoreOptions} from 'src/basic';
import {messages} from './utils';
import {App, moduleGetter} from './modules';

export function createAppWithRedux(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  moduleGetter: ModuleGetter,
  middlewares?: ControllerMiddleware[],
  appModuleName?: string,
  appViewName?: string
) {
  return {
    useStore<O extends IStoreOptions = IStoreOptions, T extends IStore = IStore>({storeOptions, storeCreator}: StoreBuilder<O, T>) {
      return {
        render() {
          const store = storeCreator(storeOptions);
          const run = renderApp(store, [], moduleGetter, middlewares, appModuleName, appViewName);
          return {store, run};
        },
      };
    },
  };
}

describe('init', () => {
  let mockStore: ReduxStore;
  const actionLogs: string[] = [];

  const storeMiddlewares: ControllerMiddleware = () => (next) => (action) => {
    actionLogs.push(action.type);
    return next(action);
  };

  beforeAll(() => {
    const {store, run} = createAppWithRedux(moduleGetter, [storeMiddlewares], 'moduleA', 'Main')
      .useStore(
        createRedux({
          enhancers: [],
          initState: {thirdParty: 123},
        })
      )
      .render();
    mockStore = store;
    return run();
  });
  beforeEach(() => {
    actionLogs.length = 0;
    messages.length = 0;
  });
  test('初始状态', () => {
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {count: 0},
    });
  });
  test('加载moduleB.Main,moduleC.Main', async () => {
    const viewB = await getView<Function>('moduleB', 'Main');
    const viewC = await getView<Function>('moduleC', 'Main');
    expect(actionLogs).toEqual(['moduleB.Init', 'moduleC.Init']);
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {count: 0},
      moduleB: {count: 0},
      moduleC: {count: 0},
    });
    expect(viewB()).toBe('moduleB_views_Main');
    expect(viewC()).toBe('moduleC_views_Main');
  });
  test('同步handler', () => {
    mockStore.dispatch(App.moduleA.actions.add());
    expect(actionLogs).toEqual(['moduleA.add', 'moduleB.add', 'moduleA.Loading', 'moduleC.add']);
    expect(messages).toEqual([
      ['moduleA/add', '{"thirdParty":123,"moduleA":{"count":0},"moduleB":{"count":0},"moduleC":{"count":0}}'],
      [
        'moduleB/moduleA.add',
        '{"thirdParty":123,"moduleA":{"count":1},"moduleB":{"count":1},"moduleC":{"count":0}}',
        '{"thirdParty":123,"moduleA":{"count":0},"moduleB":{"count":0},"moduleC":{"count":0}}',
      ],
      [
        'moduleC/moduleA.add',
        '{"thirdParty":123,"moduleA":{"count":1,"loading":{"global":"Start"}},"moduleB":{"count":1},"moduleC":{"count":1}}',
        '{"thirdParty":123,"moduleA":{"count":0},"moduleB":{"count":0},"moduleC":{"count":0}}',
      ],
    ]);
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {count: 1, loading: {global: 'Start'}},
      moduleB: {count: 1},
      moduleC: {count: 1},
    });
  });
  test('await handler', async () => {
    await mockStore.dispatch(App.moduleA.actions.add());
    expect(actionLogs).toEqual(['moduleA.add', 'moduleB.add', 'moduleA.Loading', 'moduleC.add', 'moduleA.Loading']);
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {count: 2, loading: {global: 'Stop'}},
      moduleB: {count: 2},
      moduleC: {count: 2},
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

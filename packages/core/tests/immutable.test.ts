import {getView, ModuleGetter, BuildAppOptions, buildApp} from 'src/index';
import {ReduxStore, ReduxOptions, createRedux} from 'src/lib/with-redux';
import {ControllerMiddleware} from 'src/store';
import {messages} from './utils';
import {App, moduleGetter} from './modules';

// eslint-disable-next-line @typescript-eslint/no-shadow
export function createAppWithRedux(moduleGetter: ModuleGetter, appModuleName?: string, appViewName?: string) {
  const options: BuildAppOptions<ReduxOptions> = {
    moduleGetter,
    appModuleName,
    appViewName,
  } as any;
  return {
    useStore(storeOptions: ReduxOptions) {
      options.storeOptions = storeOptions;
      return {
        render(renderOptions: {}) {
          options.renderOptions = renderOptions;
          const {store, render} = buildApp(
            createRedux,
            () => () => undefined,
            () => '',
            [],
            options
          );
          return {store, run: render};
        },
        ssr(ssrOptions: {}) {
          options.ssrOptions = ssrOptions;
          const {store, ssr} = buildApp(
            createRedux,
            () => () => undefined,
            () => '',
            [],
            options
          );
          return {store, run: ssr};
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
    const {store, run} = createAppWithRedux(moduleGetter, 'moduleA', 'Main')
      .useStore({
        enhancers: [],
        middlewares: [storeMiddlewares],
        initState: {thirdParty: 123},
      })
      .render({});
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

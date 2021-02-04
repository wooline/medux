import {getView, renderApp, ModuleStore, setConfig} from 'src/index';
import {messages} from './utils';
import {App, moduleGetter} from './modules';

setConfig({MutableData: true});

describe('init', () => {
  let mockStore: ModuleStore;
  const rootData = {thirdParty: 123};
  let moduleAData: any;
  let moduleBData: any;
  let moduleCData: any;

  beforeAll(() => {
    return renderApp<() => void>(
      (store, appView) => {
        return (appView2) => {
          appView2();
        };
      },
      moduleGetter,
      'moduleA',
      'Main',
      {initData: rootData},
      (store) => {
        mockStore = store;
        return ['moduleA'];
      }
    );
  });
  beforeEach(() => {
    messages.length = 0;
  });
  test('初始状态', () => {
    const reduxData = mockStore.getState();
    moduleAData = reduxData.moduleA;
    expect(reduxData).toEqual({
      thirdParty: 123,
      moduleA: {initialized: true, count: 0},
    });
    expect(reduxData === rootData).toBe(true);
  });
  test('加载moduleB.Main,moduleC.Main', async () => {
    const viewB = await getView<Function>('moduleB', 'Main');
    const viewC = await getView<Function>('moduleC', 'Main');
    const reduxData = mockStore.getState();
    moduleBData = reduxData.moduleB;
    moduleCData = reduxData.moduleC;
    expect(reduxData).toEqual({
      thirdParty: 123,
      moduleA: {initialized: true, count: 0},
      moduleB: {initialized: true, count: 0},
      moduleC: {initialized: true, count: 0},
    });
    expect(viewB()).toBe('moduleB_views_Main');
    expect(viewC()).toBe('moduleC_views_Main');
  });
  test('同步handler', () => {
    mockStore.dispatch(App.moduleA.actions.add2());
    expect(messages).toEqual([
      [
        'moduleA/add2',
        '{"thirdParty":123,"moduleA":{"count":0,"initialized":true},"moduleB":{"count":0,"initialized":true},"moduleC":{"count":0,"initialized":true}}',
        '{"thirdParty":123,"moduleA":{"count":0,"initialized":true},"moduleB":{"count":0,"initialized":true},"moduleC":{"count":0,"initialized":true}}',
      ],
      [
        'moduleB/moduleA.add2',
        '{"thirdParty":123,"moduleA":{"count":1,"initialized":true},"moduleB":{"count":1,"initialized":true},"moduleC":{"count":0,"initialized":true}}',
        '{"thirdParty":123,"moduleA":{"count":0,"initialized":true},"moduleB":{"count":0,"initialized":true},"moduleC":{"count":0,"initialized":true}}',
      ],
      [
        'moduleC/moduleA.add2',
        '{"thirdParty":123,"moduleA":{"count":1,"initialized":true,"loading":{"global":"Start"}},"moduleB":{"count":1,"initialized":true},"moduleC":{"count":1,"initialized":true}}',
        '{"thirdParty":123,"moduleA":{"count":0,"initialized":true},"moduleB":{"count":0,"initialized":true},"moduleC":{"count":0,"initialized":true}}',
      ],
    ]);
    const reduxData = mockStore.getState();
    expect(reduxData).toEqual({
      thirdParty: 123,
      moduleA: {count: 1, initialized: true, loading: {global: 'Start'}},
      moduleB: {count: 1, initialized: true},
      moduleC: {count: 1, initialized: true},
    });
    expect(reduxData === rootData).toBe(true);
    expect(moduleAData === reduxData.moduleA).toBe(true);
    expect(moduleBData === reduxData.moduleB).toBe(true);
    expect(moduleCData === reduxData.moduleC).toBe(true);
  });
  test('await handler', async () => {
    await mockStore.dispatch(App.moduleA.actions.add2());
    const reduxData = mockStore.getState();
    expect(reduxData).toEqual({
      thirdParty: 123,
      moduleA: {count: 2, initialized: true, loading: {global: 'Stop'}},
      moduleB: {count: 2, initialized: true},
      moduleC: {count: 2, initialized: true},
    });
    expect(reduxData === rootData).toBe(true);
    expect(moduleAData === reduxData.moduleA).toBe(true);
    expect(moduleBData === reduxData.moduleB).toBe(true);
    expect(moduleCData === reduxData.moduleC).toBe(true);
  });
});

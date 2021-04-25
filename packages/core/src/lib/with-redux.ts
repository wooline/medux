import {Reducer, compose, createStore, Unsubscribe, StoreEnhancer} from 'redux';
import {env} from '../env';
import {CommonModule, IController, ModuleGetter} from '../basic';
import {BaseStore, BaseStoreOptions, CreateApp, createApp} from '../render';
import {ControllerMiddleware} from '../store';

export interface ReduxOptions extends BaseStoreOptions {
  middlewares?: ControllerMiddleware[];
  enhancers?: StoreEnhancer[];
  initState?: any;
}

export interface ReduxStore extends BaseStore {
  subscribe(listener: () => void): Unsubscribe;
}
export type CreateAppWithRedux<RO, V> = (
  render: (store: ReduxStore, appView: V, renderOptions: RO) => (appView: V) => void,
  ssr: (store: ReduxStore, appView: V, renderOptions: RO) => {html: string; data: any},
  preModules: string[],
  moduleGetter: ModuleGetter,
  appModuleOrName: string | CommonModule,
  appViewName: string
) => ReturnType<CreateApp<ReduxOptions, ReduxStore, RO, V>>;

const reducer: Reducer = (state, action) => {
  return {...state, ...action.state};
};

declare const process: any;

const createRedux = function (controller: IController, storeOptions: ReduxOptions): ReduxStore {
  const {initState = {}, enhancers} = storeOptions;
  const enhancerList = enhancers ? [...enhancers] : [];
  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancerList.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }
  const reduxStore = createStore(reducer, initState, enhancerList.length > 1 ? compose(...enhancerList) : enhancerList[0]);
  const {dispatch, getState} = reduxStore;
  reduxStore.dispatch = controller.dispatch as any;
  controller.setStore({
    getState,
    update(actionName: string, state: any, actionData: any[]) {
      dispatch({type: actionName, state, payload: actionData});
    },
  });
  return reduxStore as ReduxStore;
};

export const createAppWithRedux: CreateAppWithRedux<any, any> = createApp.bind(null, createRedux) as any;

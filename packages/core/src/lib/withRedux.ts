import {Reducer, compose, createStore, Store, StoreEnhancer, applyMiddleware, Middleware} from 'redux';
import {env} from '../env';
import {CommonModule, IController, ModuleGetter} from '../basic';
import {CreateApp, createApp} from '../render';
import {ActionDecorator} from '../store';

interface ReduxOptions {
  actionDecorator?: ActionDecorator;
  initState?: any;
  enhancers?: StoreEnhancer[];
  middlewares?: Middleware[];
}

type CreateAppWithRedux<RO, V> = (
  render: (store: Store, appView: V, renderOptions: RO) => (appView: V) => void,
  ssr: (store: Store, appView: V, renderOptions: RO) => {html: string; data: any},
  preModules: string[],
  moduleGetter: ModuleGetter,
  appModuleOrName: string | CommonModule,
  appViewName: string
) => ReturnType<CreateApp<ReduxOptions, Store, RO, V>>;

const reducer: Reducer = (state, action) => {
  return {...state, ...action.state};
};

declare const process: any;

const createRedux = function (controller: IController, storeOptions: ReduxOptions): Store {
  const {initState = {}, middlewares, enhancers} = storeOptions;
  const enhancerList = enhancers ? [...enhancers] : [];
  if (middlewares) {
    enhancerList.push(applyMiddleware(...middlewares));
  }
  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancerList.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }
  const reduxStore = createStore(reducer, initState, enhancerList.length > 1 ? compose(...enhancerList) : enhancerList[0]);
  const {dispatch, getState} = reduxStore;
  reduxStore.dispatch = controller.dispatch.bind(controller) as any;
  controller.setStore({
    getState,
    update(actionName: string, state: any, actionData: any[]) {
      dispatch({type: actionName, state, payload: actionData});
    },
  });
  return reduxStore;
};

export const createAppWithRedux: CreateAppWithRedux<any, any> = createApp.bind(null, createRedux);

import { Unsubscribe, StoreEnhancer } from 'redux';
import { State } from '../basic';
import { BaseStore, BaseStoreOptions } from '../render';
export interface ReduxOptions extends BaseStoreOptions {
    enhancers: StoreEnhancer[];
}
export interface ReduxStore<S extends State = {}> extends BaseStore<S> {
    subscribe(listener: () => void): Unsubscribe;
}
export declare function createRedux<S extends State = {}>(storeOptions: ReduxOptions): ReduxStore<S>;

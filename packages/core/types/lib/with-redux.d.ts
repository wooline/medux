import { Unsubscribe, StoreEnhancer } from 'redux';
import { State, IStore } from '../basic';
import { StoreBuilder } from '../store';
export interface ReduxOptions {
    initState: any;
    enhancers: StoreEnhancer[];
}
export interface ReduxStore<S extends State = any> extends IStore<S> {
    subscribe(listener: () => void): Unsubscribe;
}
export declare function storeCreator(storeOptions: ReduxOptions): ReduxStore;
export declare function createRedux(storeOptions: ReduxOptions): StoreBuilder<ReduxOptions, ReduxStore>;

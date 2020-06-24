import { Action, Dispatch } from 'redux';
import { CommonModule } from '@medux/core';
export declare type Props = {
    [key: string]: any;
};
export interface Connect<Constructor> {
    <StoreState = {}, StoreProps = {}, DispatchMethods = {}, Data = {}>(module: CommonModule, mapStateToProps?: (state: StoreState, data: Data) => StoreProps, mapDispatchToProps?: (dispatch: Dispatch<Action>, initData: Data) => DispatchMethods): Constructor;
}
export declare function getPrevData(next: Props, prev: Props): Props;
export declare function diffData(prev: Props, next: Props): Props | undefined;

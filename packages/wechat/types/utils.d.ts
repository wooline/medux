import { Action, Dispatch } from 'redux';
import { CommonModule } from '@medux/core';
export declare type Props = {
    [key: string]: any;
};
export interface Connect<Constructor> {
    <State = {}, InjectedProps = {}, InjectedMethods = {}, OwnProps = {}>(module: CommonModule, mapStateToProps?: (state: State, ownProps: OwnProps) => InjectedProps, mapDispatchToProps?: (dispatch: Dispatch<Action>, ownProps: OwnProps) => InjectedMethods): Constructor;
}
export declare function getPrevData(next: Props, prev: Props): Props;
export declare function diffData(prev: Props, next: Props): Props | undefined;

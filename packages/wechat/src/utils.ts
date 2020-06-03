import {Action, Dispatch} from 'redux';

import {CommonModule} from '@medux/core';
export type Props = {[key: string]: any};
// export type MapStateToProps<TInjectedProps, TOwnProps, TState> = (state: TState, ownProps?: TOwnProps) => TInjectedProps;
// export type MapDispatchToProps<TInjectedMethods, TOwnProps> = (dispatch: Dispatch<Action>, ownProps?: TOwnProps) => TInjectedMethods;

export interface Connect<Constructor> {
  <State = {}, InjectedProps = {}, InjectedMethods = {}, OwnProps = {}>(
    module: CommonModule,
    mapStateToProps?: (state: State, ownProps: OwnProps) => InjectedProps,
    mapDispatchToProps?: (dispatch: Dispatch<Action>, ownProps: OwnProps) => InjectedMethods
  ): Constructor;
}

export function getPrevData(next: Props, prev: Props): Props {
  return Object.keys(next).reduce((result, key) => {
    result[key] = prev[key];
    return result;
  }, {});
}
export function diffData(prev: Props, next: Props): Props | undefined {
  let empty = true;
  const data = Object.keys(prev).reduce((result, key) => {
    if (prev[key] === next[key]) {
      return result;
    }

    empty = false;
    result[key] = next[key];
    return result;
  }, {});
  if (empty) {
    return;
  }
  return data;
}

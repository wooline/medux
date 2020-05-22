import { Action, Dispatch } from 'redux';
export declare type Props = {
    [key: string]: any;
};
export declare type MapStateToProps<TInjectedProps, TOwnProps, TState> = (state: TState, ownProps?: TOwnProps) => TInjectedProps;
export declare type MapDispatchToProps<TInjectedMethods, TOwnProps> = (dispatch: Dispatch<Action>, ownProps?: TOwnProps) => TInjectedMethods;
export declare function getPrevData(next: Props, prev: Props): Props;
export declare function diffData(prev: Props, next: Props): Props | undefined;

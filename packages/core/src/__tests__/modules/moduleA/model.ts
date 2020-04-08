import {BaseModelHandlers, BaseModelState, RouteState, reducer} from '../../../index';

export interface State extends BaseModelState {
  message: string;
  tips: string;
}

export const initModelState: State = {
  message: 'moduleA-message',
  tips: 'moduleA-tips',
};

// 定义本模块的Handlers
export class ModelHandlers extends BaseModelHandlers<State, {route: RouteState}> {
  @reducer
  public setMessage(message: string): State {
    return {...this.state, message};
  }
  @reducer
  public setTips(tips: string): State {
    return {...this.state, tips};
  }
}

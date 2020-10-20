import {BaseModelHandlers, BaseModelState, RouteState, reducer} from '../../../index';

export interface State extends BaseModelState {
  message: string;
  text: string;
  tips: string;
}

export const initModelState: State = {
  message: 'message',
  text: 'text',
  tips: 'tips',
};

// 定义本模块的Handlers
export class ModelHandlers extends BaseModelHandlers<State, {route: RouteState}> {
  @reducer
  public setMessage(message: string): State {
    return {...this.state, message};
  }

  @reducer
  public setText(text: string): State {
    return {...this.state, text};
  }

  @reducer
  public setTips(tips: string): State {
    return {...this.state, tips};
  }
}

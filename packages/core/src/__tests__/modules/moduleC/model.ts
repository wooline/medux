import {BaseModelHandlers, BaseModelState, RouteState, effect, reducer} from '../../../index';

export interface State extends BaseModelState {
  message: string;
  tips: string;
}

export const initModelState: State = {
  message: 'moduleC-message',
  tips: 'moduleC-tips',
};

// 定义本模块的Handlers
export class ModelHandlers extends BaseModelHandlers<State, {route: RouteState}> {
  @reducer
  public setMessage(message: string): State {
    return {...this.state, message};
  }
  @reducer
  public setTips(tips: string): State {
    console.log(tips);
    return {...this.state, tips};
  }
  @reducer
  protected ['moduleA/setMessage'](message: string): State {
    return {...this.state, message};
  }
  @effect()
  protected async ['moduleA/setTips'](tips: string) {
    this.dispatch(this.actions.setTips('moduleC-tips-change-start'));
    await Promise.resolve('');
    this.dispatch(this.actions.setTips('moduleC-tips-change-end'));
  }
}

import {BaseModelHandlers, BaseModelState, RouteState, effect, reducer} from 'core/index';

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

  @reducer
  protected ['moduleA.setMessage'](message: string): State {
    return {...this.state, message: 'message-changed'};
  }

  @effect()
  protected async ['moduleA.setText'](text: string) {
    console.log(this.rootState);
    console.log(this.currentRootState);
    console.log(this.prevRootState);
    this.dispatch(this.actions.setText('text-changed'));
  }

  @effect()
  protected async ['moduleA.setTips'](tips: string) {
    this.dispatch(this.actions.setTips('tips-changed'));
    await Promise.resolve('');
    this.dispatch(this.actions.setMessage('tips-message-changed'));
  }
}

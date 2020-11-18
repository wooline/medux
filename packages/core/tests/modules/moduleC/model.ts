import {CoreModuleHandlers, CoreModuleState, effect, reducer} from 'src/index';

export interface State extends CoreModuleState {
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
export class ModelHandlers extends CoreModuleHandlers<'moduleC', State> {
  constructor() {
    super('moduleC', initModelState);
  }

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
    console.log(this.rootState);
    console.log(this.currentRootState);
    console.log(this.prevRootState);
    return {...this.state, message: 'message-changed'};
  }

  @effect()
  protected async ['moduleA.setText'](text: string) {
    this.dispatch(this.actions.setText('text-changed'));
  }

  @effect()
  protected async ['moduleA.setTips'](tips: string) {
    this.dispatch(this.actions.setTips('tips-changed'));
  }

  @effect()
  protected async ['moduleB.setMessage'](message: string) {
    this.dispatch(this.actions.setMessage('tips-message-changed'));
  }
}

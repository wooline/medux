import {CoreModuleHandlers, CoreModuleState, reducer} from 'src/index';

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
export class ModelHandlers extends CoreModuleHandlers<'moduleA', State> {
  constructor() {
    super('moduleA', initModelState);
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
}

import {CoreModuleHandlers, CoreModuleState, reducer} from 'src/index';
import {messages} from '../../utils';

export interface State extends CoreModuleState {
  count: number;
}

// 定义本模块的Handlers
export class ModuleHandlers extends CoreModuleHandlers<State, {}> {
  constructor() {
    super({count: 0});
  }

  @reducer
  public add(prevState?: any): State {
    messages.push(['moduleA/add', JSON.stringify(this.rootState), JSON.stringify(prevState)]);
    return {...this.state, count: this.state.count + 1};
  }

  @reducer
  public add2(prevState?: any): State {
    messages.push(['moduleA/add2', JSON.stringify(this.rootState), JSON.stringify(prevState)]);
    this.state.count += 1;
    return this.state;
  }
}

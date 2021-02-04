import {CoreModuleHandlers, CoreModuleState, effect, reducer} from 'src/index';
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
  public add(): State {
    return {...this.state, count: this.state.count + 1};
  }

  @reducer
  public add2(): State {
    this.state.count += 1;
    return this.state;
  }

  @effect()
  protected async ['moduleA.add']() {
    const prevState = this.prevRootState;
    this.dispatch(this.actions.add());
    messages.push(['moduleC/moduleA.add', JSON.stringify(this.rootState), JSON.stringify(prevState)]);
  }

  @effect()
  protected async ['moduleA.add2']() {
    const prevState = this.prevRootState;
    this.dispatch(this.actions.add2());
    messages.push(['moduleC/moduleA.add2', JSON.stringify(this.rootState), JSON.stringify(prevState)]);
  }
}

import {ActionTypes, CoreModuleHandlers, CoreModuleState, reducer, effect} from 'src/index';
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
    const prevState = this.prevRootState;
    messages.push(['moduleA/add', JSON.stringify(this.rootState), JSON.stringify(prevState)]);
    return {...this.state, count: this.state.count + 1};
  }

  @reducer
  public add2(): State {
    const prevState = this.prevRootState;
    messages.push(['moduleA/add2', JSON.stringify(this.rootState), JSON.stringify(prevState)]);
    this.state.count += 1;
    return this.state;
  }

  @reducer
  public simple(): State {
    return this.state;
  }

  @reducer
  public reducerError(error: string): State {
    throw error;
  }

  @effect(null)
  public async effectError(error: string) {
    throw error;
  }

  @effect(null)
  public async effectReducerError(error: string) {
    this.dispatch(this.actions.reducerError(error));
    // this.dispatch(this.actions.simple());
  }

  @effect(null)
  public async effectEffectError(error: string) {
    this.dispatch(this.actions.effectError(error));
    this.dispatch(this.actions.simple());
  }

  @effect(null)
  protected async [ActionTypes.Error](error: Error) {
    return true;
  }
}

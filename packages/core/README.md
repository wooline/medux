## 关于@medux

请先阅读：[@medux 概述](https://github.com/wooline/medux)

# 关于@medux/core

本包是@medux 系列的核心基础包，它体现了本框架通用和抽象的状态管理机制。

## 查看 Demo

- [medux-demo-spa](https://github.com/wooline/medux-demo-spa)：基于`@medux/react-web-router`开发的 WebApp 项目
- [medux-demo-ssr](https://github.com/wooline/medux-demo-ssr)：基于`@medux/react-web-router`开发的 WebApp 项目，同时支持服务器渲染

## 基本概念与名词

前提：假设你已经熟悉了 `React` 和 `Redux`，有过一定的开发经验

### Store、Reducer、Action、State、Dispatch

以上概念与 Redux 基本一致，本框架无强侵入性，遵循 react 和 redux 的理念和原则：

- M 和 V 之间使用单向数据流
- 整站保持单个 Store
- Store 为 Immutability 不可变数据
- 改变 Store 数据，必须通过 Reducer
- 调用 Reducer 必须通过显式的 dispatch Action
- Reducer 必须为 pure function 纯函数
- 有副作用的行为，全部放到 Effect 函数中
- 每个 reducer 只能修改 Store 下的某个节点，但可以读取所有节点

### Effect

我们知道在 Redux 中，改变 State 必须通过 dispatch action 以触发 reducer，在 reducer 中返回一个新的 state， reducer 是一个 pure function 纯函数，无任何副作用，只要入参相同，其返回结果也是相同的，并且是同步执行的。而 effect 是相对于 reducer 而言的，与 reducer 一样，它也必须通过 dispatch action 来触发，不同的是：

- 它是一个非纯函数，可以包含副作用，可以无返回，也可以是异步的。
- 它不能直接改变 State，要改变 State，它必须再次 dispatch action 来触发 reducer

### ActionHandler

我们可以简单的认为：在 Redux 中 store.dispatch(action)，可以触发一个注册过的 reducer，看起来似乎是一种观察者模式。推广到以上的 effect 概念，effect 同样是一个观察者。一个 action 被 dispatch，可能触发多个观察者被执行，它们可能是 reducer，也可能是 effect。所以 reducer 和 effect 统称为：**ActionHandler**

- 如果有一组 actionHandler 在兼听某一个 action，那它们的执行顺序是什么呢？

  答：当一个 action 被 dispatch 时，最先执行的是所有的 reducer，它们被依次同步执行。所有的 reducer 执行完毕之后，才开始所有 effect 执行。

- 我想等待这一组 actionHandler 全部执行完毕之后，再下一步操作，可是 effect 是异步执行的，我如何知道所有的 effect 都被处理完毕了？
  答：本框架改良了 store.dispatch()方法，如果有 effect 兼听此 action，它会返回一个 Promise，所以你可以使用 await store.dispatch({type:"search"}); 来等待所有的 effect 处理完成。

### Module

当我们接到一个复杂的前端项目时，首先要化繁为简，进行功能拆解。通常以**高内聚、低偶合**的原则对其进行模块划分，一个 Module 是相对独立的业务功能的集合，它通常包含一个 Model(用来处理业务逻辑)和一组 View(用来展示数据与交互)，需要注意的是：

- SPA 应用已经没有了 Page 的边界，不要以 Page 的概念来划分模块
- 一个 Module 可能包含一组 View，不要以 View 的概念来划分模块

Module 虽然是逻辑上的划分，但我们习惯于用文件夹目录来组织与体现，例如：

```
src
├── modules
│       ├── user
│       │     ├── userOverview(Module)
│       │     ├── userTransaction(Module)
│       │     └── blacklist(Module)
│       ├── agent
│       │     ├── agentOverview(Module)
│       │     ├── agentBonus(Module)
│       │     └── agentSale(Module)
│       └── app(Module)
```

通过以上可以看出，此工程包含 7 大模块 app、userOverview、userTransaction、blacklist、agentOverview、agentBonus、agentSale，虽然 modules 目录下面还有子目录 user、angent，但它们仅属于归类，不属于模块。我们约定：

- 每个 Module 是一个独立的文件夹
- Module 本身只有一级，但是可以放在多级的目录中进行归类
- 每个 Module 文件夹名即为该 Module 名，因为所有 Module 都是平级的，所以需要保证 Module 名不重复，实践中，我们可以通过 Typescript 的 enum 类型来保证，你也可以将所有 Module 都放在一级目录中。
- 每个 Module 保持一定的独立性，它们可以被同步、异步、按需、动态加载

### ModuleState、RootState

系统被划分为多个相对独立且平级的 Module，不仅体现在文件夹目录，更体现在 Store 上。每个 Module 负责维护和管理 Store 下的一个节点，我们称之为 **ModuleState**，而整个 Store 我们习惯称之为**RootState**

例如：某个 Store 数据结构:

```JS

{
  route:{...},// StoreReducer
  app:{...}, // ModuleState
  userOverview:{...}, // ModuleState
  userTransaction:{...}, // ModuleState
  blacklist:{...}, // ModuleState
  agentOverview:{...}, // ModuleState
  agentBonus:{...}, // ModuleState
  agentSale:{...} // ModuleState
}
```

- 每个 Module 管理并维护 Store 下的某一个节点，我们称之为 ModuleState
- 每个 ModuleState 都是 Store 的根子节点，并以 Module 名为 Key
- 每个 Module 只能修改自已的 ModuleState，但是可以读取其它 ModuleState
- 每个 Module 修改自已的 ModuleState，必须通过 dispatch action 来触发
- 每个 Module 可以观察者身份，监听其它 Module 发出的 action，来配合修改自已的 ModuleState

你可能注意到上面 Store 的子节点中，第一个名为 router，它并不是一个 ModuleState，而是一个由第三方 Reducer 生成的节点。我们知道 Redux 中允许使用多个 Reducer 来共同维护 Stroe，并提供 combineReducers 方法来合并。由于 ModuleState 的 key 名即为 Module 名，所以：`Module名自然也不能与其它第三方Reducer生成节点重名`。

### Model

在 Module 内部，我们可进一步划分为`一个model(维护数据)`和`一组view(展现交互)`，此处的 Model 实际上指的是 view model，它主要包含两大功能：

- ModuleState 的定义
- ModuleState 的维护，前面有介绍过 ActionHandler，实际上就是对 ActionHandler 的编写

> 数据流是从 Model 单向流入 View，所以 Model 是独立不依赖于 View 的。理论上即使没有 View，整个程序依然是可以通过数据来驱动。

我们约定：

- 集中在一个名为**model.js**的文件中编写 Model，并将此文件放在本模块根目录下
- 集中在一个名为**ModuleHandlers**的 class 中编写 所有的 ActionHandler，每个 reducer、effect 都对应该 class 中的一个方法

例如，userOverview 模块中的 Model:

```
src
├── modules
│       ├── user
│       │     ├── userOverview(Module)
│       │     │         ├──views
│       │     │         └──model.ts
│       │     │
```

src/modules/user/userOverview/model.ts

```JS
// 定义本模块的ModuleState类型
export interface State extends BaseModuleState {
  listSearch: {username:string; page:number; pageSize:number};
  listItems: {uid:string; username:string; age:number}[];
  listSummary: {page:number; pageSize:number; total:number};
  loading: {
    searchLoading: LoadingState;
  };
}

// 定义本模块ModuleState的初始值
export const initState: State = {
  listSearch: {username:null, page:1, pageSize:20},
  listItems: null,
  listSummary: null,
  loading: {
    searchLoading: LoadingState.Stop,
  },
};

// 定义本模块所有的ActionHandler
class ModuleHandlers extends BaseModuleHandlers<State, RootState> {
  @reducer
  public putSearchList({listItems, listSummary}): State {
    return {...this.state, listItems, listSummary};
  }
  // 一个effect，使用ajax查询数据，然后dispatch action来触发以上putSearchList
  // this.dispatch是store.dispatch的引用
  // searchLoading指明将这个effect的执行状态注入到loading中
  @effect("searchLoading")
  public async searchList(options: {username?:string; page?:number; pageSize?:number} = {}) {
    // this.state指向本模块的ModuleState
    const listSearch = {...this.state.listSearch, ...options};
    const {listItems, listSummary} = await api.searchList(listSearch);
    this.dispatch(this.action.putSearchList({listItems, listSummary}));
  }
  // 一个effect，监听其它Module发出的Action，然后改变自已的ModuleState
  // 因为是监听其它Module发出的Action，所以它不需要主动触发，使用非public权限对外隐藏
  // @effect(null)表示不需要跟踪此effect的执行状态
  @effect(null)
  protected async ["@@framework/ROUTE_CHANGE"]() {
      // this.rootState指向整个Store
      if(this.rootState.route.location.pathname === "/list"){
          // 使用await 来等待所有的actionHandler处理完成之后再返回
          await this.dispatch(this.action.searchList());
      }
  }
}
```

需要特别说明的是以上代码的最后一个 ActionHandler：

```JS
protected async ["@@framework/ROUTE_CHANGE"](){
    // this.rootState指向整个Store
    if(this.rootState.router.location.pathname === "/list"){
        await this.dispatch(this.action.searchList());
    }
}
```

前面有强调过两点：

- Module 可以兼听其它 Module 发出的 Action，并配合来完成自已 ModuleState 的更新。
- Module 只能更新自已的 ModuleState 节点，但是可以读取整个 Store。

另外注意到语句：await this.dispatch(this.action.searchList())：

- dispatch 派发一个名为 searchList 的 action 可以理解，可是为什么前面还能 awiat？难道 dispatch action 也是异步的？

  答：dispatch 派发 action 本身是同步的，我们前面讲过 ActionHandler 的概念，一个 action 被 dispatch 时，可能有一组 reducer 或 effect 在兼听它，reducer 是同步处理的，可是 effect 可能是异步处理的，如果你想等所有的兼听都执行完成之后，再做下一步操作，此处就可以使用 await，否则，你可以不使用 await。

### View、Component

在 Module 内部，我们可进一步划分为`一个model(维护数据)`和`一组view(展现交互)`。所以一个 Module 中的 view 可能有多个，我们习惯在 Module 根目录下创建一个名为 views 的文件夹：

例如，userOverview 模块中的 views:

```
src
├── modules
│       ├── user
│       │     ├── userOverview(Module)
│       │     │         ├──views
│       │     │         │     ├──imgs
│       │     │         │     ├──List
│       │     │         │     │     ├──index.css
│       │     │         │     │     └──index.tsx
│       │     │         │     └──Main
│       │     │         │          ├──index.css
│       │     │         │          └──index.tsx
│       │     │         │
│       │     │         │
│       │     │         └──model.ts
│       │     │
```

- 每个 view 其实是一个 React Component 类，所以使用大写字母打头
- 对于 css 和 img 等附属资源，如果是属于某个 view 私有的，跟随 view 放到一起，如果是多个 view 公有的，提出来放到公共目录中。
- 在 view 中通过 dispatch action 的方式触发 Model 中的 ActionHandler，除了可以 dispatch 本模块的 action，也能 dispatch 其它模块的 action

例如，某个 LoginForm：

```JS
interface Props extends DispatchProp {
  logining: boolean;
}

class Component extends React.PureComponent<Props> {
  public onLogin = (evt: any) => {
    evt.stopPropagation();
    evt.preventDefault();
    // 发出本模块的action，将触发本model中定义的名为login的ActionHandler
    this.props.dispatch(actions.app.login({username: "", password: ""}));
  };

  public render() {
    const {logining} = this.props;
    return (
      <form className="app-Login" onSubmit={this.onLogin}>
        <h3>请登录</h3>
        <ul>
          <li><input name="username" placeholder="Username" /></li>
          <li><input name="password" type="password" placeholder="Password" /></li>
          <li><input type="submit" value="Login" disabled={logining} /></li>
        </ul>
      </form>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    logining: state.app.loading.login !== LoadingState.Stop,
  };
};

export default connect(mapStateToProps)(Component);
```

从以上代码可看出，View 就是一个 Component，那 View 和 Component 有区别吗？编码上没有，逻辑上是有的：

- view 体现的是 ModuleState 的视图展现，更偏重于表现特定的具体的业务逻辑，所以它的 props 一般是直接用 mapStateToProps connect 到 store。
- component 体现的是一个没有业务逻辑上下文的纯组件，它的 props 一般来源于父级传递。
- component 通常是公共的，而 view 通常非公用

## 动态按需加载模块

能静能动是@medux 的最大特色，模块的加载方式集中在 modules/index.ts 中配置：

```JS
// 定义模块的加载方案，同步或者异步均可
export const moduleGetter = {
  app: () => {
    // 使用 import()方法导入的 module 是异步按需加载的
    // 如果无需异步按需加载，只需要先import * as app from 'modules/app'
    // 然后在此处直接return app;
    return import(/* webpackChunkName: "app" */ 'modules/app');
  },
  comments: () => {
    return import(/* webpackChunkName: "comments" */ 'modules/comments');
  },
  photos: () => {
    return import(/* webpackChunkName: "photos" */ 'modules/photos');
  },
  videos: () => {
    return import(/* webpackChunkName: "videos" */ 'modules/videos');
  },
  messages: () => {
    return import(/* webpackChunkName: "messages" */ 'modules/messages');
  },
};
```

## 几个特殊的 Action，你可以监听它们

- **@@framework/ROUTE_CHANGE**：路由发生变化时将触发此 action
- **@@framework/ERROR**：发生 error 时将自动派发此 action
- **module/INIT**：模块初次载入时会触发此 action
- **module/LOADING**：触发加载进度时会触发此 action，比如 @effect(login)
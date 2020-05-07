欢迎您开始 @medux 之旅，建议您依次阅读以下 4 篇文章，这将耗费您大约 30 分钟。

- [为什么你需要 medux](/medux/docs/01)
- [**medux 基础概念速览**](/medux/docs/02)
- [medux 路由篇](/medux/docs/03)
- [medux 数据流](/medux/docs/04)

第 2 篇：@medux 基础概念速览

[**-- Github 地址 ---**](https://github.com/wooline/medux)

## 8 个新概念与名词

假设你了解过 `Redux`或者别的`Flux`框架，那么应当知道 Store、State、Reducer、Action、Dispatch 是什么意思。没错，在 @medux 中它们依然受用，只是 Action 的概念发生了一点微妙的变化，它具有更多 Event 事件的特性。

### Effect

我们知道在 Redux 中，改变 State 必须通过 dispatch action 以触发 reducer。而 effect 是相对于 reducer 而言的，它也必须通过 dispatch action 来触发，不同的是：

- 它是一个非纯函数，可以包含副作用，可以无返回，也可以是异步的
- 它不能直接改变 State，必须再次 dispatch action 来触发 reducer

### ActionHandler

我们可以简单的认为：store.dispatch(action)，可以触发 reducer 和 effect 执行，看起来 action 似乎可以当作一种事件。reducer 和 effect 可以当作是该事件的监听者，所以 reducer 和 effect 统称为：**ActionHandler。**

### Module

我们通常以**高内聚、低偶合**的原则进行模块划分，一个 Module 是相对独立的业务功能的集合，它通常包含一个 Model (用来处理业务逻辑) 和一组 View (用来展示数据与交互)，需要注意的是：不要以 UI 视觉作为划分原则。

### Model

上面说过 Module 中包括`一个model(维护数据)`和`一组view(展现交互)`，而 model 主要包含两大职能：

- ModuleState 的定义
- ActionHandler 的定义

> 数据流是从 Model 单向流入 View，所以 Model 是独立不依赖于 View 的。理论上即使没有 View，整个程序依然是可以通过数据来驱动。

### ModuleState、RootState

系统被划分为多个相对独立的 Module，不仅体现在文件夹目录，更体现在 State 数据结构中。每个 Module 负责维护和管理 State 下的一个子节点，我们称之为 **ModuleState**，而整个 State 我们习惯称之为**RootState**

- 每个 ModuleState 都是 Store 的一级子节点，以 Module 名为 Key
- 每个 Module 只能修改自已的 ModuleState，但是可以读取其它 ModuleState
- 每个 Module 修改自已的 ModuleState，必须通过 dispatch action 来触发
- 每个 Module 可以监听其它 Module 发出的 action，来配合修改自已的 ModuleState

### View、Component

View 本质上还是一个 Component，它们有逻辑上的区别：

- View 用来展示业务，Component 用来展示交互
- View 一定属于某个 Module，Component 可以属于某个 Module 专用，也可以属于全部 Module
- View 通常订阅了 Store，并从 Store 中之间获得数据，Component 则只能通过 props 来进行传递

## 典型工程结构

```
src
├── assets // 存放公共静态资源
├── entity // 存放业务实体类型定义
├── common // 存放公共代码
├── components // 存放UI公共组件
├── modules
│       ├── app //一个名为app的module
│       │     ├── assets //存放该module私有的静态资源
│       │     ├── components //存放该module私有的UI组件
│       │     ├── views
│       │     │     ├── TopNav
│       │     │     ├── BottomNav
│       │     │     └── ...
│       │     ├── model.ts //定义本模块model
│       │     └── index.ts //导出本模块
│       ├── photos //另一个名为photos的module
│       │     └── ...
│       └── index.ts //模块配置与管理
└──index.ts 启动入口
```

## 一个 model 的定义

```typescript
// 定义本模块的ModuleState类型
export interface State extends BaseModuleState {
  listSearch: {username: string; page: number; pageSize: number};
  listItems: {uid: string; username: string; age: number}[];
  listSummary: {page: number; pageSize: number; total: number};
  loading: {
    searchLoading: LoadingState;
  };
}

// 定义本模块ModuleState的初始值
export const initState: State = {
  listSearch: {username: null, page: 1, pageSize: 20},
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
  @effect('searchLoading')
  public async searchList(options: {username?: string; page?: number; pageSize?: number} = {}) {
    const listSearch = {...this.state.listSearch, ...options};
    const {listItems, listSummary} = await api.searchList(listSearch);
    this.dispatch(this.action.putSearchList({listItems, listSummary}));
  }
  // 可以监听其它Module发出的Action，然后改变自已的ModuleState
  @effect(null)
  protected async ['medux.RouteChange']() {
    if (this.rootState.route.location.pathname === '/list') {
      await this.dispatch(this.action.searchList());
    }
  }
}
```

## 能静能动的模块加载机制

模块的加载策略通常集中在 modules/index.ts 中配置：

```javascript
import * as app from 'modules/app';

// 定义模块的加载方案，同步或者异步均可
export const moduleGetter = {
  app: () => {
    // 使用import同步加载
    return app;
  },
  photos: () => {
    // 使用import()异步加载
    return import(/* webpackChunkName: "photos" */ 'modules/photos');
  },
};
```

## 几个特殊的内置 Action

- **medux.RouteChange**：路由发生变化时将触发此 action
- **medux.Error**：捕获到 error 时将自动派发此 action
- **moduleName.Init**：模块初次载入时会触发此 action
- **moduleName.RouteParams**：模块路由参数发生变化时会触发此 action
- **moduleName.Loading**：跟踪加载进度时会触发此 action

## 关于错误处理

执行发生错误时，框架会自动 dispatch 一个 type 为 **medux.Error** 的 errorAction，你可以监听此 action 来处理错误，例如：

```typescript
  @effect(null)
  protected async [ActionTypes.Error](error: CustomError) {
    if (error.code === '401') {
      this.dispatch(this.actions.putShowLoginPop(true));
    } else if (error.code === '404') {
      this.dispatch(this.actions.putShowNotFoundPop(true));
    } else {
      error.message && Toast.fail(error.message);
      //继续向上throw错误将导致运行中断
      throw error;
    }
  }
```

## 路由 Store 化

medux 将路由视为另一种 Store，它跟 Redux 的 Store 一样影响着 UI 的展示，在 Component 中你不用刻意区分引起 UI 变化的是 ReduxStore 还是 RouteStore，它们都是一样的。比如：

> 评论区块的展示与关闭，你可以使用 2 种方式来触发：

- '/article/10' => '/article/10/showComments'，路由变化可以引起评论区块的展示与关闭
- {showComments: false} => {showComments: true}，state 变化也可以达到同样的效果

到底是使用路由来控制还是 state 控制？我们希望 component 中不要做刻意的区分，这样后期修改方案时无需动到 component 本身。

**你把路由当成另一个 Store 就对了**，只不过这个 RouteStore 可以任由用户在地址栏中直接修改，这和用户鼠标点击交互修改本质上是一样的。所以做好准备把 ReduxStore 中的一部分数据抽离出来放入 RouteStore 中，然后让用户通过 URL 任意修改吧...

路由的终极目的就是为了变更 UI，所以不管什么路由方案，总能解析出以下通用信息：

- 当前路由会展示哪些 view
- 以及展示这些 view 需要的参数

medux 将这些通用信息抽象成状态。**至此，你可以忘掉路由了，一切都是 state，一切都遵循 UI=Render(State)**。于是乎原来包含副作用的路由组件变成了普通组件：

```jsx
//原来需要路由组件
<Switch>
  <Route exact path="/admin/home" component="{AdminHome}" />
  <Route exact path="/admin/role/:listView" component="{AdminRole}" />
  <Route path="/admin/member/:listView" component="{AdminMember}" />
</Switch>

//现在直接变成普通组件
<Switch>
  {routeViews.adminHome?.Main && <AdminHome />}
  {routeViews.adminRole?.List && <AdminRole />}
  {routeViews.adminMember?.List && <AdminMember />}
</Switch>
```

具体如何提取通用信息，又如何将其转换成为状态呢？方案有很多种，我实现了一种：

- [**@medux/route-plan-a**](https://github.com/wooline/medux/tree/master/packages/route-plan-a)

你也可以实现更多 plan-b、plan-c...

## CoreAPI

[查看 CoreAPI 文档](https://github.com/wooline/medux/tree/master/packages/core/api)

## Demo

[medux-react-admin](https://github.com/wooline/medux-react-admin)：基于`@medux/react-web-router`和最新的`ANTD 4.x`开发的通用后台管理系统，除了演示 medux 怎么使用，它还创造了不少独特的理念

## 继续阅读下一篇

[medux 路由篇](/medux/docs/03)
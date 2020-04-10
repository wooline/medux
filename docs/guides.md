如果你没有了解过 medux 的概况，请先看看 Readme：[https://github.com/wooline/medux](https://github.com/wooline/medux)

## 8 个新概念与名词

假设你了解过 `Redux`或者别的`Flux`框架，那么应当知道 Store、State、Reducer、Action、Dispatch 是什么意思。没错，在 medux 中它们依然受用，只是 Action 的概念发生了一点微妙的变化，它具有更多 Event 事件的特性。

### Effect

我们知道在 Redux 中，改变 State 必须通过 dispatch action 以触发 reducer。而 effect 是相对于 reducer 而言的，它也必须通过 dispatch action 来触发，不同的是：

- 它是一个非纯函数，可以包含副作用，可以无返回，也可以是异步的
- 它不能直接改变 State，必须再次 dispatch action 来触发 reducer

### ActionHandler

我们可以简单的认为：store.dispatch(action)，可以触发 reducer 和 effect，看起来 action 似乎可以当作一种事件。reducer 和 effect 可以当作是该事件的观察者，所以 reducer 和 effect 统称为：**ActionHandler**

### Module（模块）

我们通常以**高内聚、低偶合**的原则进行模块划分，一个 Module 是相对独立的业务功能的集合，它通常包含一个 Model(用来处理业务逻辑)和一组 View(用来展示数据与交互)，需要注意的是：不要以 UI 视觉作为划分原则

### Model

上面说过 module 中包括`一个model(维护数据)`和`一组view(展现交互)`，而 model 主要包含两大职能：

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

- view 是 ModuleState 的视图展现，更偏重于表现特定的具体的业务逻辑，所以它的 props 可以直接用 mapStateToProps connect 到 store。
- component 体现的是一个纯组件，它的 props 一般来源于父级传递。
- component 通常是公共的，而 view 通常是特有的

---

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

```TS
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
  @effect("searchLoading")
  public async searchList(options: {username?:string; page?:number; pageSize?:number} = {}) {
    const listSearch = {...this.state.listSearch, ...options};
    const {listItems, listSummary} = await api.searchList(listSearch);
    this.dispatch(this.action.putSearchList({listItems, listSummary}));
  }
  // 可以监听其它Module发出的Action，然后改变自已的ModuleState
  @effect(null)
  protected async ["medux.RouteChange"]() {
      if(this.rootState.route.location.pathname === "/list"){
          await this.dispatch(this.action.searchList());
      }
  }
}
```

## 能静能动的模块加载机制

模块的加载策略集中在 modules/index.ts 中配置：

```JS
import * as app from 'modules/app'

// 定义模块的加载方案，同步或者异步均可
export const moduleGetter = {
  app: () => {// 使用import同步加载
    return app;
  },
  photos: () => {// 使用import()异步加载
    return import(/* webpackChunkName: "photos" */ 'modules/photos');
  },
};
```

## 几个特殊的内置 Action，你可以监听它们

- **medux.RouteChange**：路由发生变化时将触发此 action
- **medux.Error**：捕获到 error 时将自动派发此 action
- **moduleName.Init**：模块初次载入时会触发此 action
- **moduleName.RouteParams**：模块路由参数发生变化时会触发此 action
- **moduleName.Loading**：跟踪加载进度时会触发此 action

## 关于错误处理

effect 执行发生错误时，框架会自动 dispatch 一个 type 为 **medux.Error** 的 errorAction，你可以监听此 action 来处理错误，例如：

```TS
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

medux 将路由及参数视为另一种 Store，它跟 Redux 的 Store 一样影响着 UI 的展示，有时候你不用刻意区分引起 UI 变化的是 ReduxStore 还是 RouteStore，它们都是一样的。比如：

> 评论区块的展示与关闭

- '/article/10' => '/article/10/showComments'，路由变化可以引起评论区块的展示与关闭
- {showComments: false} => {showComments: true}，state 变化也可以达到同样的效果

到底是使用路由来控制还是 state 控制？我们希望 component 中不要做刻意的区分，这样后期修改方案时无需动到 component 本身。

**你把路由当成另一个 Store 就对了**，只不过这个 RouteStore 可以任由用户在地址栏中直接修改，这和用户鼠标点击交互修改本质上是一样的。所以做好准备把 ReduxStore 中的一部分数据抽离出来放入 RouteStore 中，然后让用户通过 URL 任意修改吧...

medux 将这个特殊的 RouteStore 放在 ReduxStore 的子节点 route 中：

```TS
// 带路由的State数据结构举例
{
  route: {
    location: any; //原始路由信息
    data: { //这便是转换之后的 RouteStore
      paths: ["app.Main", "photos.Details", "comments.List"],
      views: {
        app: {Main: true},
        photos: {Details: true},
        comments: {List: true}
      }
      params: {//每个模块都可以利用路由来存放一些状态
        // 对应moduleState中的routeParams
        photos:{photoID: 32},
        comments:{
          listSearch:{sortBy: "datetime", page: 1, pageSize: 20}
        }
      }
    }
  },
  app: { //app模块的moduleState
    routeParams: null
    ...
  },
  photos: { //photos模块的moduleState
    routeParams: {photoID: 32} //photos模块的路由状态
    ... // photos模块的其它状态
  },
  comments: { //comments模块的moduleState
    routeParams: { //comments模块的路由状态
      listSearch:{sortBy: "datetime", page: 1, pageSize: 20}
    }
    ... //comments模块的其它状态
  },
}
```

## 更多 API

[**@medux/core**](https://github.com/wooline/medux/tree/master/packages/core)：顶层抽象的状态及模块管理框架。[查看 API](https://github.com/wooline/medux/tree/master/packages/core/api)

---

# 废话少说，直接上 Demo

[medux-react-admin](https://github.com/wooline/medux-react-admin)：基于`@medux/react-web-router`和最新的`ANTD 4.x`开发的通用后台管理系统。

最新文档：[https://github.com/wooline/medux](https://github.com/wooline/medux)

## 关于@medux

请先阅读：[@medux 概述](https://github.com/wooline/medux)

# 关于@medux/core

本包是@medux 系列的核心基础包，它体现了本框架通用和抽象的状态管理机制。

## 兼容性

支持 IE8 及以上现代浏览器。IE11 及以下浏览器请自行加入`polyfill`，并使用 src 目录的 TS 源码重新编译。

- 对于不支持 proxy 对象的浏览器，需要手动加载 model
- 对于 IE8 不支持 getter，请在 ModelHandlers 中请使用 this.getState()来获取 moduleState，而不是使用 this.state。
- 对于不能同时支持转码 decorators 和 count property 的环境时，可以将 ActionType 的 module 分隔符由 "`/`" 改为 "`_`"、将多 ActionType 分隔符由 "`,`" 改为 "`$`"，从而避免使用特殊字符命名类的方法，例如：

```JS
  //同时监听本模块的Init和RouteChange，默认使用count property写法：
  @effect(null)
  protected async [`this/${ActionTypes.MInit},${ActionTypes.RouteChange}`]() {
    ...
  }

  //可以改为普通写法：
  import {setConfig} from "@medux/core";
  setConfig({ NSP: "_", MSP: "$" });
  ...
  @effect(null)
  protected async this_Init$medux_RouteChange() {
    ...
  }
```

## 查看 Demo

- [medux-demo-spa](https://github.com/wooline/medux-demo-spa)：基于`@medux/react-web-router`开发的 WebApp 项目
- [medux-demo-ssr](https://github.com/wooline/medux-demo-ssr)：基于`@medux/react-web-router`开发的 WebApp 项目，同时支持服务器渲染

---

- [基本概念与名词](#基本概念与名词)
  - [Store、Reducer、Action、State、Dispatch](#storereduceractionstatedispatch)
  - [Effect](#effect)
  - [ActionHandler](#actionhandler)
  - [Module](#module)
  - [ModuleState、RootState](#modulestaterootstate)
  - [Model](#model)
  - [View、Component](#viewcomponent)
- [动态按需加载模块](#动态按需加载模块)
- [几个特殊的 Action，你可以监听它们](#几个特殊的-action你可以监听它们)
- [关于错误处理](#关于错误处理)
- [抽象的路由机制](#抽象的路由机制)
  - [路由通常包含 3 种 UI 状态信息](#路由通常包含-3-种-ui-状态信息)
  - [@medux/core 中路由结构的定义](#meduxcore-中路由结构的定义)
  - [@medux/core 与第三方路由系统的融合](#meduxcore-与第三方路由系统的融合)

## 基本概念与名词

前提：假设你已经熟悉了 `Redux`，有过一定的开发经验

### Store、Reducer、Action、State、Dispatch

以上概念与 Redux 基本一致，本框架无强侵入性，遵循 redux 的理念和原则：

- M 和 V 之间使用单向数据流
- 整站保持单个 Store
- Store 为 Immutability 不可变数据
- 改变 Store 数据，必须通过 Reducer
- 调用 Reducer 必须通过显式的 dispatch Action
- Reducer 必须为 pure function 纯函数
- 有副作用的行为，全部放到 Effect 函数中
- 每个 reducer 只能修改 Store 下的某个节点，但可以读取所有节点

### Effect

我们知道在 Redux 中，改变 State 必须通过 dispatch action 以触发 reducer。而 effect 是相对于 reducer 而言的，它也必须通过 dispatch action 来触发，不同的是：

- 它是一个非纯函数，可以包含副作用，可以无返回，也可以是异步的
- 它不能直接改变 State，要改变 State，它必须再次 dispatch action 来触发 reducer

### ActionHandler

我们可以简单的认为：在 Redux 中 store.dispatch(action)，可以触发一个注册过的 reducer，看起来似乎是一种观察者模式。effect 同样是一个观察者，一个 action 被 dispatch，可能触发多个观察者被执行，它们可能是 reducer，也可能是 effect。所以 reducer 和 effect 统称为：**ActionHandler**

> 如果有一组 actionHandler 在监某一个 action，它们的执行优先顺序是：

- 先执行所有 reducer

  1. 如果 action 本身有定义 priority，按 priority 顺序
  2. 与 action 同模块的 reducer
  3. 根模块的 reducer
  4. 其它模块的 reducer

- 后执行所有 effect

  1. 如果 action 本身有定义 priority，按 priority 顺序
  2. 与 action 同模块的 effect
  3. 根模块的 effect
  4. 其它模块的 effect

> 我想等待这一组 actionHandler 全部执行完毕之后，再下一步操作，可是 effect 是异步执行的，我如何知道所有的 effect 都被处理完毕了？

答：本框架改良了 store.dispatch()方法，如果有 effect 监听此 action，它会返回一个 Promise，所以你可以使用 await store.dispatch({type:"search"}); 来等待所有的 effect 处理完成。

### Module（模块）

当我们接到一个复杂的前端项目时，首先要化繁为简，进行功能拆解。通常以**高内聚、低偶合**的原则对其进行模块划分，一个 Module 是相对独立的业务功能的集合，它通常包含一个 Model(用来处理业务逻辑)和一组 View(用来展示数据与交互)，需要注意的是：

- SPA 应用已经没有了 Page 的边界，不要以 Page 的概念来划分模块
- 一个 Module 可能包含一组 View，不要以 View 的概念来划分模块

我们习惯于用文件夹目录来组织与体现，例如：

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
- 所有 Module 都是平级的，但是可以放在多级的目录中进行归类
- 每个 Module 文件夹名即为该 Module 名
- 每个 Module 保持一定的独立性，它们可以被同步、异步、按需、动态加载

### ModuleState、RootState

系统被划分为多个相对独立且平级的 Module，不仅体现在文件夹目录，更体现在 ReduxStore 数据结构中。每个 Module 负责维护和管理 Store 下的一个节点，我们称之为 **ModuleState**，而整个 ReduxStore 我们习惯称之为**RootState**

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

你可能注意到上面 Store 的子节点中，第一个名为 router，它并不是一个 ModuleState，而是一个由第三方 Reducer 生成的节点。所以`Module名自然也不能与其它第三方Reducer生成节点重名`。

### Model

在 Module 内部，我们可进一步划分为`一个model(维护数据)`和`一组view(展现交互)`，model 主要包含两大内容：

- ModuleState 的定义
- ActionHandler 的定义

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
  protected async ["medux/RouteChange"]() {
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
protected async ["medux/RouteChange"](){
    // this.rootState指向整个Store
    if(this.rootState.router.location.pathname === "/list"){
        await this.dispatch(this.action.searchList());
    }
}
```

- Module 可以监听其它 Module 发出的 Action，并配合来完成自已 ModuleState 的更新。
- Module 只能更新自已的 ModuleState 节点，但是可以读取整个 RootState。
- await dispatch() 等待所有 ActionHandler 执行完(包括异步的 effect)。

### View、Component

在 Module 内部，我们可进一步划分为`一个model(维护数据)`和`一组view(展现交互)`。我们习惯在 Module 根目录下创建一个名为 views 的文件夹：

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

- 如果使用 React，每个 view 其实是一个 React Component
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

View 就是 Component，它们有逻辑上的区别：

- view 是 ModuleState 的视图展现，更偏重于表现特定的具体的业务逻辑，所以它的 props 一般是直接用 mapStateToProps connect 到 store。
- component 体现的是一个没有业务逻辑上下文的纯组件，它的 props 一般来源于父级传递。
- component 通常是公共的，而 view 通常不公用

## 动态按需加载模块

能静能动是@medux 的最大特色，我们在开发过程中无需将模块的加载逻辑混入业务逻辑中，这样会让问题更复杂，@medux 中模块的加载方案作为一种优化策略可以被随时更改和配置。

模块的加载方式集中在 modules/index.ts 中配置：

```JS
// 定义模块的加载方案，同步或者异步均可
export const moduleGetter = {
  app: () => {
    // 使用 import()方法导入的 module 是异步按需加载的
    // 如果无需异步按需加载，只需先import * as app from 'modules/app'
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

- **medux/RouteChange**：路由发生变化时将触发此 action
- **medux/Error**：发生 error 时将自动派发此 action
- **module/Init**：模块初次载入时会触发此 action
- **module/Loading**：触发加载进度时会触发此 action，比如 @effect(login)

## 关于错误处理

model 内 effect 执行发生错误时，框架会自动 dispatch 一个 名为 **medux/Error** 的 errorAction，你可以监听此 action 来处理错误，例如：

```JS
  @effect(null)
  protected async [ActionTypes.Error](error: CustomError) {
    if (error.code === '401') {
      this.dispatch(this.actions.putShowLoginPop(true));
    } else if (error.code === '404') {
      this.dispatch(this.actions.putShowNotFoundPop(true));
    } else {
      error.message && Toast.fail(error.message);
      throw error;
    }
  }
```

如果在此错误处理的 effect 中再次重新 throw error，表明此 errorHandler 处理不了该错误，此时：

- 如果设置`error.meduxProcessed=false`，则该 error 会重新引起新的 dispatch **medux/Error**，从而让别的 errorHandler 处理。
- 如果设置`error.meduxProcessed=true`或者默认不作 meduxProcessed 设置，则后续不再 dispatch **medux/Error**，该错误将往上传递成为 uncatched 错误

## 抽象的路由机制

不同平台，不同 UI 框架有着各种不同的路由方案，我们用发散的思维描述一下路由：

- 从交互来看，路由是程序的多个不同的入口
- 从状态来看，路由是程序 UI 状态的一种描述
- 通过控制 UI 状态，程序可以得到不同的外观切片
- 可控的 UI 状态越多越细，程序的切片就能越多越细
- 跟 ReduxState 一样，路由也是一种 State，我们可以称其为 RouteState，它们一起反映程序当前的运行状态
- 或者说路由只不过是将 ReduxState 中剥离出一部分状态，放在地址栏(web）中，供用户自行修改与控制

比如：我想显示与隐藏评论，在不使用路由时，我们通常会这样定义 moduleState：

```JS
{
  showComments:boolean
}
```

如果我想用路由来控制显示与隐藏评论，只需要将 showComments 状态转移到 RouteState 中，在 web 浏览器中使用 URL 来描述 RouteState：`/list?showComments=true`，对应的 moduleState 将变成这样的结构：

```JS
{
  routeParams:{
    showComments:boolean
  }
}
```

### 路由通常包含 3 个状态信息

不管我们使用什么方案，通常我们能从路由状态中解析出以下信息：

> 以 web 路由为例，假设有 URL：/photos/32/comments?params={comments:{listSearch:{sortBy: "datetime",page:1,pageSize:20}}} 当前页面上显示的是图片 id 为 32 的详情，并且同时展示了相关评论列表

- `paths`：string[] 描述当前界面中 View 的层级嵌套。比如 URL 表示 View 的层级：[app.Main, photos.Details, comments.List]
- `views`：{[moduleName:string]:{[viewName:string]:boolean}} 通过上面`paths`能分析出当前界面展示了`哪些模块的哪些 view`，比如：

  ```JS
  {
    app:{
      Main:true
    },
    photos:{
      Details:true
    },
    comments:{
      List:true
    }
  }
  ```

- `params`：{[moduleName:string]:any} 描述当前界面的 UI 状态。比如：

  ```JS
  // 我们 ReduxState 是按 module 组织的，各个 module 维护自已的状态
  // 同样对于 RouteState，也是按 module 组织的
  {
    photos:{
      photoID:32
    },
    comments:{
      listSearch:{
        sortBy: "datetime",
        page: 1,
        pageSize: 20,
      }
    },
  }
  ```

### @medux/core 中路由结构的定义

```JS
interface RouteData {
  paths: string[];
  views: [moduleName: string]: {[viewName: string]: boolean};
  params: {[moduleName: string]: {[key: string]: any}};
}
```

其中的 params 是分 module 来维护的，它也是 moduleState 的一部分，所以它最终会合并到 moduleState 中，这样一来 moduleState 被分为两类数据：一类是 routeParmas 路由数据，一类是其它数据，于是我们这样定义 BaseModuleState：

```JS
interface BaseModelState<RouteParams> {
  routeParams?: RouteParams;
}
```

RouteData.params 是所有 BaseModelState.routeParams 的集合，总的 RootState 变成这样的结构：

```JS
{
  route: {
    location: any; //第三方系统自已维护的路由状态
    data: {
      paths: ["app.Main", "photos.Details", "comments.List"],
      views: {
        app: {Main: true},
        photos: {Details: true},
        comments: {List: true}
      }
      params: {
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

所以看起来路由参数 params 被存了 2 份，一份是顶层的 RouteData 中，另一份则是被合并到了各个 Module 的 routeParams 中。这 2 份数据有什么不同的意义呢？

- RouteData 中的 params 是跟随路由变化而临时产生的，而 Module 中的 routeParams 是跟模块状态一起持久的。比如路由变化而引起某 ModuleA 不在界面上显示了，此时 RouteData 中的 params.moduleA 可能已经没了，但 ModuleA 中的 routeParams 依然存在。
- RouteData 中的 params 表示用户预达状态，比如用户想翻到第 2 页，此时 RouteData.params.comments.listSearch.page 会等于 2，这一部分是先变的。但是有时由于各种原因目标并不能顺利达成，比如网络断了，此时该怎么描述状态呢？
- Module 中的 routeParams 则是表示有效的当前状态，如果翻页成功了它的 page 变成 2，如果失败则不变。
- 简单来说就是，顶层路由中的 params 反映目标，而 module 中的 params 反映当前实际。只有确定目标执行成功了，才能将其 update 为与目标一致的状态。

### @medux/core 与第三方路由系统的融合

不同平台和框架路由方案都不一样，路由状态的数据结构也各异，@medux/core 中的路由定义是抽象的，并不具体实现。它仅提供一个抽象接口：

```JS
interface HistoryProxy<L = any> {
  getLocation(): L; //获取第三方路由状态
  subscribe(listener: (location: L) => void): void; //定阅第三方路由的改变
  locationToRouteData(location: L): RouteData; //将第三方路由状态转变为RouteData
  equal(a: L, b: L): boolean;// 比较两个路由状态（用于TimeTravelling）
  patch(location: L, routeData: RouteData): void; //同步第三方路由（用于TimeTravelling）
}
```

该接口定义了@medux/core 如何与第三方路由方案的融合，只要实现该 HistoryProxy 即可将本框架与其它框架联动起来。比如：

- 与 web 浏览器 history 的融合方案：[@medux/web](https://github.com/wooline/medux/tree/master/packages/web) 、[@medux/web-route-plan-a](https://github.com/wooline/medux/tree/master/packages/web-route-plan-a)
- 与 React Navigation 的融合方案：[@medux/react-native-router](https://github.com/wooline/medux/tree/master/packages/react-native-router)
- 与 Taro 路由的融合方案：

## 学习交流

- Email：[wooline@qq.com](wooline@qq.com)
- reac-coat 学习交流 QQ 群：**929696953**，有问题可以在群里问我

  ![QQ群二维码](https://github.com/wooline/react-coat/blob/master/docs/imgs/qr.jpg)

- 欢迎批评指正，觉得还不错的别忘了给个`Star` >\_<，如有错误或 Bug 请反馈

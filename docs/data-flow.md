欢迎您开始 @medux 之旅，建议您依次阅读以下 4 篇文章，这将耗费您大约 30 分钟。

- [为什么你需要 medux](/medux/docs/01)
- [medux 基础概念速览](/medux/docs/02)
- [medux 路由篇](/medux/docs/03)
- [**medux 数据流**](/medux/docs/04)

第 4 篇：medux 数据流

[**-- Github 地址 ---**](https://github.com/wooline/medux)

## @medux 数据流示意图

![data-flow.png](https://cdn.nlark.com/yuque/0/2020/png/1294343/1587048601414-277fa483-5329-41e0-a3bd-27cfa1f0faf5.png)

## 基于 Redux

因为 Medux 基于 Redux，所以部分数据流与 Redux 很相似，比如：

- 保持全局单例的 Store
- Store 和 View 之间使用单向数据流
- 改变 Store 数据，必须通过 Reducer
- 调用 Reducer 必须通过显式的 dispatch Action

## 模块化 Store

- 每个 module 仅能通过 reducer 修改 Store 下的某个一级子节点(moduleState)，跨 module 不能直接修改
- 每个 module 可以读取所有 Store 的子节点
- Store 一级子节点除了 moduleState 还可以是其它 ReduxReducers 管理的节点(比如 route)，它们依然遵循以上原则

## 封装 Effect

- 将所有副作用封装在 Effect 中执行
- Effect 要修改 Store，必须重新 dispatch Action 通过 Reducer 来执行
- Effect 可以通过 dispatch Action 来触执行另一个 Effect
- Effect 执行是异步的，可以使用 await 来跟踪其执行结果，比如：

```javascript
...
await this.dispatch(this.action.searchList());
this.dispatch(this.action.showPop());
```

## 跟踪 Effect 的执行

你只需在定义 Effect 的装饰器中加入可控的参数既可注入其 loading 状态到 moduleState 中：

```typescript
// loadingForGroupName 注入加载状态的分组key，默认为global，如果为null表示不注入加载状态
// loadingForModuleName 可将loading状态合并注入到其他module，默认为入口主模块
function effect(loadingForGroupName?: string | null, loadingForModuleName?: string)

// 例如
@effect('global')
public async login(username:string, password:string){
  ...
}
```

除了 loading 状态，你还可以直接编写 effect 执行前后的钩子：

```typescript
function logger(before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void));
```

## 让 Action 具有 Event 性质

reducer 或 effect 我们统称为 ActionHandler，当执行 store.dispatch(action)时，会触发一个目标 ActionHandler 的执行，我们称之为`主ActionHandler`。除了主 ActionHandler，还可以存在一系列`从ActionHandler`来配合执行，它们可以属于不同的 module，所以通常用来解决 module 之间的协作。

从本文顶部的 medux 数据流示意图中看出，蓝色的 Action 似乎像一条总线穿透各个 module，它的 Event 性质让整个模块变得松散起来

## ActionHandler 的执行顺序

一个 Action 被 dispatch 可能引起一系列 reducer 和 effect 执行，那么它们的执行顺序是怎样的呢？

- `主ActionHandler`总是先执行
- `从ActionHandler`默认是按注册顺序，但是你可以设置 Action.priority 来强制干预
- reducer 是同步的，它们总是先执行
- effect 是异步的，它们会并发执行，除非你使用 await

```typescript
interface Action {
  type: string;
  priority?: string[]; //执行优先级
  payload?: any[];
}
```

## 当 ActionHandler 执行出错时

当 actionHandler 执行出错时，medux 会自动 dispatch 一个 type 为`medux.Error`的新 Action，你可以 handler 这个 ErrorAction，并对错误进行处理：

- 如果在处理中继续 throw 错误，将不再重复 dispatch ErrorAction，当前代码将中断执行
- 否则被视为解决了错误，代码继续往下执行

## View 和 Component

View 本质上就是一个 Component，但是 View 用来展示业务，Component 用来展示交互。从本文最开始的 Medux 数据流示意图中看出：

- View 通常订阅了 Store，并从 Store 中之间获得数据。Component 则只能通过 props 来进行传递
- View 一定属于某个 Module。Component 可以属于某个 Module 专用，也可以属于全部 Module
- View 和 Component 之间可以相互嵌套
- View 和 View 之间也可以相互嵌套，但是不能直接通过 import 另一个 view，必须通过 loadView 方法加载

```javascript
const RoleSelector = loadView('adminRole', 'Selector');
```

## 关于 RouteState

框架会自动监听路由的变化，并将路由信息解析为 RouteState，然后：

- 通过`dispatch medux.RouteChange`Action 将其注入 Redux 一级子节点 route 中
- 通过`dispatch moduleName.RouteParams`Action 将其注入相应的 moduleState
- 你可以监听以上 2 个 action 来做一些事情

## 使用 MutableData 可变数据

> 喜欢 vue 或 mobx 的朋友可能会问，medux 是要求可变数据还是不可变数据？

虽然 medux 是基于 redux 的，但本着实用至上的原则，并不要求严格遵循 redux 模型，它是另一个 flux 框架。

medux 框架内部会使用 ImmutableData 来自动生成并管理 state 及其 1 级节点，对于这个内置数据结构通常你也无需干预。而对于次级的 moduleState 你可以将它定义为 一个 MutableData，然后直接在 reducer 中修改 state 并返回它，尽管这有违 reducer 的本意，但这是对接 MutableData 最简单灵活的方案。

## CoreAPI

[查看 CoreAPI 文档](https://github.com/wooline/medux/tree/master/packages/core/api)

## web+medux+react

[**@medux/react-web-router**](https://github.com/wooline/medux/tree/master/packages/react-web-router)：整合封装了@medux/core、@medux/web、@medux/route-plan-a、@medux/react, 是 web 环境下开发 react 的开箱即用框架

## Demo

[medux-react-admin](https://github.com/wooline/medux-react-admin)：基于`@medux/react-web-router`和最新的`ANTD 4.x`开发的通用后台管理系统，除了演示 medux 怎么使用，它还创造了不少独特的理念

欢迎您开始 @medux 之旅，建议您依次阅读以下 4 篇文章，这将耗费您大约 30 分钟。

- [**为什么你需要 medux**](/medux/docs/01)
- [medux 基础概念速览](/medux/docs/02)
- [medux 路由篇](/medux/docs/03)
- [medux 数据流](/medux/docs/04)

# 为什么你需要 @medux

[**-- Github 地址 ---**](https://github.com/wooline/medux)

## 一站式解决方案

通常一个前端工程包含如下职能：

- UI 渲染框架
- 状态管理
- 路由管理
- 模块化管理（包括模块的定义、加载、维护）
- 结构化管理（如何组织各类文件与资源）

其中 UI 框架与宿主平台密切相关，比较独立且复杂，通常有多种不同风格的解决方案可供选择。而除此之外其它职能相对简单，基本上都可以抽象为通用跨平台的 JS 运行时。

所以简单来说，`@medux`想创建一个可以对接不同 `第三方UI框架`的通用前端框架，它包含统一的**状态管理**、**路由管理**、**模块化管理**、**结构化管理**等职能，可以广泛运行于支持 JS 运行时的平台上，这正是时下热门的`跨平台跨端`前端工程解决方案。

## 加厚的状态管理层

也许你还在犹豫是不是需要独立的状态管理层，因为把状态管理写在 UI 渲染层里似乎也挺顺手。但是在@medux 看来，你不仅需要把它们从 UI 中分离出来，而且还要尽可能的剥离多一点，因为：

- 状态层往往更抽象与稳定，UI 层更复杂与多变，将稳定的东西剥离出来可以减少改动
- 剥离状态管理后的 UI 更纯粹：**UI=Render(State)**
- 不用考虑 UI 组件的生命周期以及各种钩子，状态管理也更简单直观
- 不与特定 UI 相关联，便于重用与多端跨平台

## 基于 Redux 也支持 Mutable Data 的另一种 Flux 框架

> 喜欢 vue 或 mobx 的朋友可能会问，medux 是要求可变数据还是不可变数据？

虽然 medux 是基于 redux 的，但本着实用至上的原则，并不要求严格遵循 redux 模型，它是另一个 flux 框架。

medux 框架内部会使用 ImmutableData 来自动生成并管理 state 及其 1 级节点，对于这个内置数据结构通常你也无需干预。而对于次级的 moduleState 你可以将它定义为 一个 MutableData，然后直接在 reducer 中修改 state 并返回它，尽管这有违 reducer 的本意，但这是对接 MutableData 最简单灵活的方案。

## 更松散的跨 Module 协作

在复杂的长业务流程中，跨模块调用与协作是少不了的，很多框架都支持模块化及跨模块 dispatch action，但是它们往往只支持主动调用，例如：

```javascript
login(){
  ...
  if(response.success){
      dispatch({type: 'moduleB/someType'});
      dispatch({type: 'moduleC/someType'});
  }
}
```

medux 引入独特的 actionHandler 机制，让 action 可以具有 Event 特性，于是你可以在 moduleB、moduleC 中使用订阅监听模式：

```javascript
{
  @reducer
  ['moduleA.login'](){
    //...doSomethings
  }
}
```

## 武装到牙齿的类型推断

medux 号称一站式的前端框架，但它绝不是简单的轮子拼凑，也不想做个松散的大杂烩，所以从一开始就使用 Typescript 编写，并且将 UI 管理、状态管理、模块化管理使用各种类型推断紧密结合起来。

![type-check.png](https://cdn.nlark.com/yuque/0/2020/png/1294343/1587010068641-9dec8e99-3827-46d2-8439-a2495dbf14ec.png#align=left&display=inline&height=553&margin=%5Bobject%20Object%5D&name=type-check.png&originHeight=553&originWidth=780&size=120732&status=done&style=none&width=780)

## 去路由化

medux 刻意弱化了路由的概念，将路由视为另一种 Store，它跟 Redux 的 Store 一样影响着 UI 的展示，在 component 中你不用刻意区分引起 UI 变化的是 ReduxStore 还是 RouteStore，它们都是一样的，严格遵循 **UI=Render(State)**

所以一些我们常见的路由组件@medux 并不推荐使用，例如

```jsx
<Switch>
  <Route exact path="/admin/home" component="{AdminHome}" />
  <Route exact path="/admin/role/:listView" component="{AdminRole}" />
  <Route path="/admin/member/:listView" component="{AdminMember}" />
</Switch>
```

它们的主要问题如下：

- 将路由绑定到组件，render 不再纯粹，包含了外部环境的副作用
- 将 path 硬编码到组件中，不利于后期修改
- path 作为一个 string 类型，失去了类型推断与检查

那么在@medux 中你可以这样改写为普通组件：

```jsx
<Switch>
  {routeViews.adminHome?.Main && <AdminHome />}
  {routeViews.adminRole?.List && <AdminRole />}
  {routeViews.adminMember?.List && <AdminMember />}
</Switch>
```

## 优雅的支持 SSR 同构

网上很多号称`SSR同构`的解决方案（例如 nextjs），要么对 client 端有很多限制和要求，要么 client 端和 server 端差别还是很大。而 Medux `重状态管理，轻UI`的策略对 SSR 同构有着天然的支持。参见 Demo

## 更彻底的模块化

一个使用@medux 的典型工程结构：

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

其它网上常用的工程结构：

```
src
├── assets // 存放公共静态资源
├── common // 存放公共代码
├── components // 存放UI公共组件
├── routers // 配置路由加载器
├── layouts // 存放各种布局版型
│       ├── LayoutA
│       ├── LayoutB
│       └── ...
├── pages // 存放各种页面
│       ├── PageA
│       ├── user
│       │     ├── PageB
│       └── ...
├── views // 存放各种视图
│       ├── ViewA
│       ├── user
│       │     ├── ViewB
│       └── ...
├── store // 存放模块化的状态管理
│       ├── modules
│       │     ├── modelA
│       │     ├── modelB
│       │     └── ...
│       └── index.ts //store配置与管理
└──index.ts 启动入口
```

对比如下：

- medux 使用 module 为一级分类，module 下面再分 model、components、view、assets。其它常见框架通常只对 model 部分使用模块化，而 components、view 和 assets 并未很好的模块化
- medux 分模块依据的是 **高内聚低耦合**的业务内在逻辑。其它常见框架通常分模块的依据是**UI 视觉**
- medux 将一个模块整体打包成一个 bundle，模块可以插拔与按需加载。其它常见框架通常对一个 view 打包成一个 bundle，从实际业务场景出发，我们通常需要插拔的是整个业务功能模块，而不仅仅是一个 view
- medux 对于 view 和 component 有清晰的定位与界限：component 为 UI 交互控件，只能通过 props 传值不可以直接使用 ReduxStore，而 view 是业务视图，它可以直接使用 ReduxStore。其它常见框架对于 component 与 view 并无清晰的定位，通常是依据视觉上主观感受
- medux 只强制区分 view 和 component，因为如果不能给出明确的界限就不要让用户迷茫。其它常见框除此之外还定义了 layouts、routers、pages。那么问题来了:
  - 在 single 单页应用中，page 概念已经变得很模糊，何为 page?
  - UI 组件都支持嵌套或者 slot 插槽，layout 概念也已经变得很模糊
  - 路由变化可以引起 UI 的加载与卸载，State 变化同样可以，为什么要区分路由组件和普通组件

## 能静能动的模块加载机制

模块可以同步加载，也可以异步按需加载。但是我们在开发过程中不能将模块的加载逻辑混入业务逻辑中，这样会让问题更复杂。medux 中的模块加载被视为一种策略可以随时更改，除了配置文件，无需更多代码变更。

# @medux 概述

本框架前身是我早些年写的另一个框架 [**react-coat**](https://github.com/wooline/react-coat)，它因为捆绑了 React UI 框架，变得不再纯粹。

现在 @medux 被封装成了一系列 npm 包，它们从抽象到具体，你可以选配某些包并进行二次开发，也可以直接使用开箱即用的平台 UI 集成包

## 包含以下 Packages

- [**@medux/core**](https://github.com/wooline/medux/tree/master/packages/core)：核心基础包
- [**@medux/web**](https://github.com/wooline/medux/tree/master/packages/web)：让 @medux/core 具有 web 特性，主要体现在 History 管理上
- [**@medux/route-plan-a**](https://github.com/wooline/medux/tree/master/packages/route-plan-a)：实现一套基于 @medux/core 的跨平台路由方案，它将 web 的路由风格带入其它平台
- [**@medux/react**](https://github.com/wooline/medux/tree/master/packages/react)：@medux/core 结合 React 的封装
- [**@medux/react-web-router**](https://github.com/wooline/medux/tree/master/packages/react-web-router)：整合封装了@medux/core、@medux/web、@medux/route-plan-a、@medux/react, 是 web 环境下开发 react 的开箱即用框架

以下是正在开发，尚未完成的 Packages：

- **@medux/vue-web-router**：@medux/core 结合 VUE，思路很简单，在 Reducer 中直接修改 ModuleState 然后返回它
- **@medux/react-native-router**：@medux/core 结合 ReactNative

## 兼容性

支持 IE8 及以上现代浏览器。IE11 及以下浏览器请自行加入`polyfill`，并使用 src 目录的 TS 源码重新编译。

参见[具体细节](https://github.com/wooline/medux/blob/master/docs/ie8.md)

## model 代码风格

以下是某个使用 @medux 的 model，可以先大概感受一下它的风格：

```typescript
// 仅需一个类，搞定 action、dispatch、reducer、effect、loading
export class ModelHandlers extends BaseModelHandlers<State, RootState> {
  @reducer
  protected putCurUser(curUser: CurUser): State {
    return {...this.state, curUser};
  }
  @reducer
  public putShowLoginPop(showLoginPop: boolean): State {
    return {...this.state, showLoginPop};
  }
  @effect('login') // 将loading状态注入key为login的state中
  public async login(payload: {username: string; password: string}) {
    const loginResult = await sessionService.api.login(payload);
    if (!loginResult.error) {
      this.dispatch(this.actions.putCurUser({curUser: loginResult.data}));
      Toast.success('欢迎您回来！');
    } else {
      Toast.fail(loginResult.error.message);
    }
  }
  // model内错误会触发medux.ERROR的action，监听并发送给后台
  @effect(null) // 设置为null表示不需要跟踪loading
  protected async ['medux.ERROR'](error: CustomError) {
    if (error.code === '401') {
      this.dispatch(this.actions.putShowLoginPop(true));
    } else if (error.code === '301' || error.code === '302') {
      //路由跳转
      historyActions.replace(error.detail);
    } else {
      Toast.fail(error.message);
      await settingsService.api.reportError(error);
    }
  }
  // 监听自已的INIT Action，做一些异步数据请求
  @effect()
  protected async ['this.INIT']() {
    const [projectConfig, curUser] = await Promise.all([settingsService.api.getSettings(), sessionService.api.getCurUser()]);
    this.dispatch(
      this.actions.updateState({
        projectConfig,
        curUser,
      })
    );
  }
}
```

## 在 view 中 dispatchAction

拥有丰富的 typescript 类型推断与反射是 medux 的一大特点：

![4.png](https://cdn.nlark.com/yuque/0/2020/png/1294343/1587024429845-e973eb31-d157-4812-8ccf-577f86cc515c.png#align=left&display=inline&height=222&margin=%5Bobject%20Object%5D&name=4.png&originHeight=222&originWidth=952&size=52556&status=done&style=none&width=952)

## CoreAPI

[查看 CoreAPI 文档](https://github.com/wooline/medux/tree/master/packages/core/api)

## Demo

[medux-react-admin](https://github.com/wooline/medux-react-admin)：基于`@medux/react-web-router`和最新的`ANTD 4.x`开发的通用后台管理系统，除了演示 medux 怎么使用，它还创造了不少独特的理念

# 继续阅读下一篇

[medux 基础概念速览](/medux/docs/02)

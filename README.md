## 一站式解决方案

通常一个前端工程包含如下职能：

- UI 渲染框架
- 状态管理
- 路由管理
- 模块化管理（包括模块的定义、加载、维护）
- 结构化管理（如何组织各类文件与资源）

其中 UI 框架与宿主平台密切相关，比较独立且复杂，通常有多种不同风格的解决方案可供选择。而除此之外其它职能相对简单，基本上都可以抽象为通用跨平台的 JS 运行时。

> 所以简单来说，`medux`想创建一个可以对接不同 `第三方UI框架`的通用前端框架，它包含统一的**状态管理**、**路由管理**、**模块化管理**、**结构化管理**等职能，可以广泛运行于支持 JS 运行时的平台上，这正是时下热门的`跨平台跨端`前端工程解决方案

## 加厚的状态管理层

也许你还在犹豫是不是需要独立的状态管理层，因为把状态管理写在 UI 渲染层里似乎也挺顺手。但是在 medux 看来，你不仅需要把它们从 UI 中分离出来，而且还要尽可能的剥离多一点，因为：

- 状态层往往更抽象与稳定，UI 层更复杂与多变，将稳定的东西剥离出来可以减少改动
- 剥离状态管理后的 UI 更纯粹：**UI=Render(State)**
- 不用考虑 UI 组件的生命周期以及各种钩子，状态管理也更简单直观
- 不与特定 UI 相关联，便于重用与多端跨平台

## 基于`Redux`也支持 `Mutable Data` 的另一种 Flux 框架

- 简化 Redux 及 Action 的繁琐调用
- State 及其一级节点强制使用 Immutable 数据结构，但次级节点（通常是一个 ModuleState）并不要求，所以如果你喜欢，也可以结合使用 Mobx 或者 VueData
- 你不一定把它当作 Redux 来使用，但是绝对的理念是你必须显式的通过 dispatch Action 来改变状态

## 武装到牙齿的类型推断

Medux 号称一站式的前端框架，但它绝不是简单的轮子拼凑，也不想做个松散的大杂烩，所以从一开始就使用 Typescript 编写，并且将 UI 管理、状态管理、模块化管理使用各种类型推断紧密结合起来。

![TS Types](https://github.com/wooline/medux/blob/master/imgs/type-check.png)

## 优雅的支持 SSR 同构

网上很多号称`SSR同构`的解决方案（例如 nextjs），要么对 client 端有很多限制和要求，要么 client 端和 server 端差别还是很大。而 Medux `重状态管理，轻UI`的理念对 SSR 同构有着天然的支持。参见 Demo

## 能静能动的模块加载机制

模块可以同步加载，也可以异步按需加载。但是我们在开发过程中不能将模块的加载逻辑混入业务逻辑中，这样会让问题更复杂。medux 中的模块加载被视为一种策略可以随时更改，除了配置文件，无需更多代码变更。

## 彻底的模块化

一个使用 medux 的典型工程结构：

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

- medux 使用 module 为一级分类，module 下面再分 model、components、view、assets
- 其它常见框架通常只对 model 部分使用模块化，而 components、view 和 assets 并未很好的模块化
- medux 分模块依据的是**高内聚低耦合**的业务内在逻辑
- 其它常见框架通常分模块的依据是**UI 视觉**
- medux 将一个模块整体打包成一个 bundle，模块可以插拔与按需加载
- 其它常见框架通常对一个 view 打包成一个 bundle，从实际业务场景出发，我们通常需要插拔的是整个业务功能模块，而不仅仅是一个 view
- medux 对于 view 和 component 有清晰的定位与界限：component 为 UI 交互控件，只能通过 props 传值不可以直接使用 ReduxStore，而 view 是业务视图，它可以直接使用 ReduxStore
- 其它常见框架对于 component 与 view 并无清晰的定位，通常是依据视觉上主观感受
- medux 只强制区分 view 和 component，因为如果不能给出明确的界限就不要让用户迷茫
- 其它常见框除此之外还定义了 layouts、routers、pages。那么问题来了:
  - 在 single 单页应用中，page 概念已经变得很模糊，何为 page?
  - UI 组件都支持嵌套或者 slot 插槽，layout 概念也已经变得很模糊
  - 路由变化可以引起 UI 的加载与卸载，State 变化同样可以达到路由的效果，路由皆组件

---

本框架前身是我早些年写的另一个框架 [**react-coat**](https://github.com/wooline/react-coat)，它因为捆绑了 React UI 框架，变得不再纯粹。
现在 medux 被封装成了一系列 npm 包，它们从抽象到具体，你可以选配某些包并进行二次开发，也可以直接使用终端开箱即用的平台 UI 集成包。

## @medux 包含以下 Packages

- [**@medux/core**](https://github.com/wooline/medux/tree/master/packages/core)：顶层抽象的状态及模块管理框架。[查看 API](https://github.com/wooline/medux/tree/master/packages/core/api)
- [**@medux/web**](https://github.com/wooline/medux/tree/master/packages/web)：让`@medux/core`具有 web 特性，主要体现在 History 管理上。[查看 API](https://github.com/wooline/medux/tree/master/packages/web/api)
- [**@medux/route-plan-a**](https://github.com/wooline/medux/tree/master/packages/route-plan-a)：实现一套基于`@medux/core`的跨平台路由方案。[查看 API](https://github.com/wooline/medux/tree/master/packages/route-plan-a/api)
- [**@medux/react**](https://github.com/wooline/medux/tree/master/packages/react)：`@medux/core`结合 `React`。[查看 API](https://github.com/wooline/medux/tree/master/packages/react/api)
- [**@medux/react-web-router**](https://github.com/wooline/medux/tree/master/packages/react-web-router)：整合`@medux/core`、`@medux/web`、`@medux/route-plan-a`、`@medux/react`的开箱即用框架。[查看 API](https://github.com/wooline/medux/tree/master/packages/react-web-router/api)

以下是尚未完成的 Packages：

- **@medux/vue-web-router**：`@medux/core`结合 `VUE`。
- **@medux/react-native-router**：`@medux/core`结合 `ReactNative`。

## 兼容性

支持 IE8 及以上现代浏览器。IE11 及以下浏览器请自行加入`polyfill`，并使用 src 目录的 TS 源码重新编译。

参见[具体细节](https://github.com/wooline/medux/blob/master/docs/ie8.md)

## 一个 model 的代码样例

```TS
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
  @effect("login") // 将loading状态注入key为login的state中
  public async login(payload: {username: string; password: string}) {
    const loginResult = await sessionService.api.login(payload);
    if (!loginResult.error) {
      this.dispatch(this.actions.putCurUser({curUser: loginResult.data}));
      Toast.success("欢迎您回来！");
    } else {
      Toast.fail(loginResult.error.message);
    }
  }
  // model内错误会触发medux.ERROR的action，监听并发送给后台
  @effect(null) // 设置为null表示不需要跟踪loading
  protected async ["medux.ERROR"](error: CustomError) {
    if (error.code === "401") {
      this.dispatch(this.actions.putShowLoginPop(true));
    } else if (error.code === "301" || error.code === "302") {
      //路由跳转
      historyActions.replace(error.detail);
    } else {
      Toast.fail(error.message);
      await settingsService.api.reportError(error);
    }
  }
  // 监听自已的INIT Action，做一些异步数据请求
  @effect()
  protected async ["this.INIT"]() {
    const [projectConfig, curUser] = await Promise.all([
      settingsService.api.getSettings(),
      sessionService.api.getCurUser()
    ]);
    this.dispatch(this.actions.updateState({
      projectConfig,
      curUser,
    }))
  }
}
```

## 在 view 中 dispatchAction

Typescript 类型反射：

![TS类型反射](https://github.com/wooline/react-coat/blob/master/docs/imgs/4.png)

## Demo

- [medux-react-admin](https://github.com/wooline/medux-react-admin)：基于`@medux/react-web-router`和最新的`ANTD 4.x`开发的通用后台管理系统。

## 开始 medux 之旅

Ok，至此，相信你已经大概知道了 medux 是一个什么类型的框架，如果对它还有点兴趣，不妨在多了解一点细节

### [>使用指南<](https://github.com/wooline/medux/blob/master/docs/guides.md)

**欢迎批评指正，觉得还不错的别忘了给个`Star` >\_<，如有错误或 Bug 请反馈**

- 本框架由 [**react-coat**](https://github.com/wooline/react-coat) 进化发展而来，去除其与 react 的捆绑，使其成为一个纯状态管理框架，更广泛的适应于各种 Javascript 运行环境和 UI 框架。
- 本框架基于 [**redux**](https://github.com/reduxjs/redux) 理念，加入模块化方案、抽象路由、通用结构等概念，是前端组织结构的最佳实践之一
- @medux 包括一系列的 npm 包，它们基础到上层，由抽象到具体，可插拔也可自定义，以满足不同场景下的开发需求。
- 为 Typescript 而生，同时支持 SPA(单页应用)和 SSR(服务器渲染)、完美的支持客户端与服务端同构

## @medux 包含以下 Packages

- **@medux/core**：基础包，顶层抽象的状态管理框架
- **@medux/web**：基于`@medux/core`，是其在 web 环境下的解决方案，主要体现在浏览器特有的 History API
- **@medux/web-route-plan-a**：基于`@medux/web`，是一套具体的路由序列化与反序列化方案
- **@medux/react**：基于`@medux/core`，是其与 React 框架的结合
- **@medux/react-web-router**：基于`@medux/react`、`@medux/web`、`react-router`，是 React 开发 WebApp 的方案
- **@medux/react-native-router**：基于`@medux/react`、`react-native`、`react-navigation`，是 React-Native 的开发方案
- **@medux/taro**：基于`@medux/core`，是其与 `@tarojs/taro`的结合（开发中...）
- **@medux/vue**：基于`@medux/core`，是其与 Vue 框架的结合（未完成...）

> 之所以分开这么多 package，是为了让您可以根据自已的实际需要选择性使用，或者基于某些基础包定制自已的上层方案

## 兼容性

支持 IE9 以上现代浏览器。IE11 及以下浏览器请自行加入`polyfill`，推荐直接使用 src 目录的 TS 源码重新编译

## 部分 Demo

- [medux-demo-spa](https://github.com/wooline/medux-demo-spa)：基于`@medux/react-web-router`开发的 WebApp 项目
- [medux-demo-ssr](https://github.com/wooline/medux-demo-ssr)：基于`@medux/react-web-router`开发的 WebApp 项目，同时支持服务器渲染

## 代码举例

### 工程结构举例

```
src
├── asset // 存放公共静态资源
│       ├── css
│       ├── imgs
│       └── font
├── entity // 存放业务实体TS类型定义
├── common // 存放公共代码
├── components // 存放React公共组件
├── modules
│       ├── app //一个module
│       │     ├── views
│       │     │     ├── TopNav
│       │     │     ├── BottomNav
│       │     │     └── ...
│       │     ├── model.ts //定义本模块model
│       │     └── index.ts //导出本模块
│       ├── photos //一个module
│       │     ├── views
│       │     ├── model.ts
│       │     └── index.ts
│       ├── names.ts //定义模块名，使用枚举类型来保证不重复
│       └── index.ts //导出模块的全局设置
└──index.ts 启动入口
```

### model 定义举例

```JS
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
  @effect("login") // 参数login表示使用自定义loading状态
  public async login(payload: {username: string; password: string}) {
    const loginResult = await sessionService.api.login(payload);
    if (!loginResult.error) {
      // this.updateState()是this.dispatch(this.actions.updateState(...))的快捷
      this.updateState({curUser: loginResult.data});
      Toast.success("欢迎您回来！");
    } else {
      Toast.fail(loginResult.error.message);
    }
  }
  // uncatched错误会触发@@framework/ERROR，监听并发送给后台
  @effect(null) // 不需要loading，设置为null
  protected async ["@@framework/ERROR"](error: CustomError) {
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
  protected async ["this/INIT"]() {
    const [projectConfig, curUser] = await Promise.all([
      settingsService.api.getSettings(),
      sessionService.api.getCurUser()
    ]);
    // this.updateState()是this.dispatch(this.actions.updateState(...))的快捷
    this.updateState({
      projectConfig,
      curUser,
    });
  }
}
```

### 调用 model 举例

Typescript 类型反射：

![TS类型反射](https://github.com/wooline/react-coat/blob/master/docs/imgs/4.png)

## 对比 react-coat

- 本框架由 [**react-coat**](https://github.com/wooline/react-coat) 进化发展而来，去除其与 react 的捆绑，使其成为一个纯状态管理框架，更广泛的适应于各种 Javascript 运行环境和 UI 框架。
- 进一步简化 API 调用：
  - 无需再依赖 connected-react-router
  - 去除 module/facade 概念及文件
  - 无需再使用 exportView() 方法导出 view
  - 无需再使用 exportModel()方法导出 model
  - 如无特别需求，在 SSR 时，无需手动导入 model
- 更多区别请查看 Demo

## 关于@medux/core

参阅：[@medux/core](https://github.com/wooline/medux/tree/master/packages/core)

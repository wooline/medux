服务器渲染(Server-Side Rendering)并不是一个复杂的技术，而 `服务器渲染` 与 `服务器同构渲染` 则是 2 个不同的概念，重点在于：**同构**，要做到一套代码完美的运行在浏览器与服务器之上不是一件简单的事情，目前业界也没有特别满意的方案，都需要或多或少的对不同的环境做差异化处理。

# 同构渲染的目标与意义

通常同构渲染主要是为了：

- 利于 SEO 搜索引擎收录
- 加快首屏呈现时间
- 同时拥有`单页(SPA)`和`多页路由`的用户体验

通常同构渲染需要做到：

- 浏览器与服务器复用同一套代码。
- 用户访问的第一个页面(首屏)由服务器渲染输出，以利于 SEO 和加快呈现速度。
- 首屏由服务器渲染输出之后，浏览器在其基础上进一步渲染，但不再做重复工作，包括不再重复请求数据。
- 之后用户访问的其它页面都不再经过服务器渲染，以减少服务器压力和达到`单页(SPA)`的用户体验。
- 在之后的交互过程中刷新浏览器，需要保持当前页面并重新由服务器渲染，以实现`多页路由`的用户体验。

# 同构渲染的难点与金钥匙

## 获取初始化数据

同构渲染的主要难点在于 Client 端渲染时组件生命周期钩子承载了太多的职能与副作用，比如：获取数据、路由、按需加载、模块化等等，这些逻辑被分散在各个组件中随着组件的渲染动态执行，而它们的执行又再次引起组件的重新渲染。简单来说就是：

> Render -> Hooks -> Effects -> ReRender -> Hooks -> Effects...

这样的渲染流程在 Server 端是不行的，因为通常 Sever 端不会 ReRender，因此必须把所有副作用都提前执行，而后在一次性 Render，简单来说就是：

> Effects -> State -> Render

那么解决方案就是将这些副作用尽量的与组件的生命周期钩子脱离，并引入独立的状态管理机制来管理它们，让 UI 渲染变成简单纯粹的 PrueRender，而这正是[@medux](https://github.com/wooline/medux) 所倡导的`状态驱动`理念。

## 异步按需加载

在 Client 端渲染时，为了提升加载速度我们通常对代码进行 chunk 分包、并使用`异步按需加载`来优化用户体验。而在 Server 端渲染时这变得完全没必要，反而会拖慢加载速度。如何在 server 端中替换异步代码为同步代码呢？正好[@medux](https://github.com/wooline/medux)将模块加载视为一种配置策略，它可以很轻松的让将模块加载在同步和异步之间切换。

# 运行 Demo

本项目 fork 自[**medux-react-admin**](https://github.com/wooline/medux-react-admin)，这是一个使用 Medux+React+Antd4+Hooks+Typescript 开发的 WEB 单页应用，你可以从本项目中看到如何将一个 SinglePage(`单页应用`) 快速转换为支持 SEO 的多页应用。

> **项目地址**：[https://github.com/wooline/medux-react-ssr](https://github.com/wooline/medux-react-ssr)

- [**在线预览**](http://medux-react-ssr.80zp.com)

> 打开以下页面，使用鼠标右键点击“查看网页源码”，看是否输出了 Html

- [/login](http://medux-react-ssr.80zp.com/login)
- [/register](http://medux-react-ssr.80zp.com/register)
- [/article/home](http://medux-react-ssr.80zp.com/article/home)
- [/article/service](http://medux-react-ssr.80zp.com/article/service)
- [/article/about](http://medux-react-ssr.80zp.com/article/about)

## 安装

```
// 注意一下，因为本项目风格检查要求以 LF 为换行符
// 所以请先关闭 Git 配置中 autocrlf
git config --global core.autocrlf false
git clone https://github.com/wooline/medux-react-ssr.git
cd medux-react-ssr
yarn install
```

## 以开发模式运行

- 运行 `yarn start`，会自动启动一个开发服务器。
- 开发模式时 React 热更新使用最新的 [React Fast Refresh](https://www.npmjs.com/package/react-refresh) 方案，需要安装最新的 React Developer Tools。

## 以产品模式运行

- 首先运行 yarn build-local，会将代码编译到 /dist/local 目录
- 然后进入 /dist/local 目录下，运行 node start.js，会启动一个产品服务器 Demo，但是真正线上运行建议使用 Nginx，输出目录中有 Nginx 配置样例可供参考

# 主要改造步骤说明

## 确定目标与任务

这是一个典型的后台管理系统，页面主要分为 2 类：

- 第一类是需要用户登录后可见的如：[/admin/xxx](http://medux-react-ssr.80zp.com/admin/home)
- 第二类则是无需登录的如：[/article/xxx](http://medux-react-ssr.80zp.com/article/service)

我们之所以要使用 SSR 改造它主要是为了让第二类页面能被搜索引起收录(SEO)，而对于第一类页面，因为需要用户登录，所以对于搜索引擎也没什么意义，我们依然沿用纯浏览器渲染就好。

## 两个入口，一套代码，两套输出

![流程示意图](https://user-gold-cdn.xitu.io/2020/5/16/17219577433949f6?w=400&h=460&f=png&s=22983)

### 区分启动入口

既然是**同构**，我们当然不希望为 2 端平台做太多的差异化处理，但是还是会有少许的定制代码。比如启动入口，原来是`./src/index.ts`，现在我们需要将其区分为：

- client.ts 原浏览器端入口文件，使用 buildApp()方法创建应用
- server.ts 新增服务器端入口文件，使用 buildSSR()方法创建应用

利用这 2 个不同的入口，我们集中构建一些 shim，抹平一些平台的差异化。

### 区分 webpack 编译配置

运行在 Sever 端的代码无需异步按需加载、无需处理 CSS、无需处理图片等等，所以我们使用 2 套 webpack 配置来进行编译打包并分别输出在 `dist/client/` 和 `dist/server/` 目录下。

> 对于 Sever 端的输出其实就只有一个 main.js 文件。

### 编译与运行

怎么部署和运行编译后输出的代码？本项目编写了一个 express 的简单样例可供参考，目录结构大致为这样：

```text
dist
├── package.json // 运行需要的依赖
├── start.js     // nodejs启动入口
├── pm2.json     // pm2部署配置
├── nginx.conf   // nginx配置样例
├── env.json     // 运行环境变量配置
├── 404.html     // 404错误页面
├── 50x.html     // 500错误页面
├── index.html   // SSR模版
├── mock         // mock假数据目录
├── html         // 生成的纯静态化页面目录
│     ├── login.html
│     ├── register.html
│     └── article
├── server        // Server端输出目录
│     └── main.js // SSR主程代码
├── client        // Client端输出目录
│     ├── css     // 生成的CSS文件目录
│     ├── imgs    // 未经工程化处理的图片目录
│     ├── media   // 经webpack处理过的图片目录
│     └── js      // 浏览器运行JS目录
```

- 对于 dist/client 就是一个静态目录，你可以使用 Nginx 部署
- 对于 dist/server 其实就是一个 JS Module 文件 `main.js`，它只有一个`default export`的方法：

  ```typescript
  export default function render(
    location: string
  ): Promise<{
    html: string | ReadableStream<any>;
    data: any;
    ssrInitStoreKey: string;
  }>;
  ```

  你可以使用任意 node 服务器(如 express)来执行它，并得到渲染后的 `data、html、已及脱水数据的key`。至于你要如何让服务器输出这些结果，以及如何处理执行过程出现的异常和错误，你可以自由发挥，例如：

## 处理初始化数据

前面我们说过应用在 Server 端运行的流程是：Effects -> State -> Render，也就是说：`先获取数据，再渲染组件`。

在 medux 框架中数据处理是封装在 model 中的，而初始化数据通常是在 model 中通过监听 `module.Init` 这个 Action 来执行 Effect，从而处理数据并转化为 moduleState。当一个 module 被加载时，不论 Client 端还是 Server 端都会触发这个 Action，所以在这个 ActionHandler 中我们要注意的是：如果 Server 端已经做过的工作，Client 端没必要再重复做了。可以通过`moduleState.isHydrate`来判断当前的 moduleState 是否已经是服务器处理过，例如：

```typescript
// src/modules/app/model.ts

@effect(null)
protected async ['this.Init']() {
  if (this.state.isHydrate) {
    //如果已经经过SSR服务器渲染，那么getProjectConfig()无需执行了
    const curUser = await api.getCurUser();
    this.dispatch(this.actions.putCurUser(curUser));
    if (curUser.hasLogin) {
      this.getNoticeTimer();
      this.checkLoginRedirect();
    }
  } else {
    //如果是初次渲染，可能运行在client端也可能运行在server端
    const projectConfig = await api.getProjectConfig();
    this.updateState({projectConfig});
    //服务端都是游客，无需获取用户信息
    if (!isServer()) {
      const curUser = await api.getCurUser();
      this.dispatch(this.actions.putCurUser(curUser));
      if (curUser.hasLogin) {
        this.getNoticeTimer();
        this.checkLoginRedirect();
      }
    }
  }
}
```

## 处理用户登录

我们只对无需用户登录的页面进行 SSR，所以在 Server 端中用户假定都是游客。在全局的错误处理 Handler 中，遇到需要登录的错误时：

- 如果当前是 Client 端，则路由到登录页或者弹出登录弹窗
- 如果当前是 Server 端，则直接终止渲染，抛出 303 错误即可。(我们可以在服务器中 catch 303 错误，直接发送统一的 index.html)

```typescript
// src/modules/app/model.ts

@effect(null)
protected async [ActionTypes.Error](error: CustomError) {
  if (isServer()) {
    //服务器中间件会catch 301错误，跳转URL
    if (error.code === CommonErrorCode.redirect) {
      throw {code: '301', detail: error.detail};
    } else {
      //服务器直接终止渲染，改为client端渲染
      //服务器中间件会catch 303错误，直接发送统一的 index.html
      throw {code: '303'};
    }
  }
  ...
}
```

## 处理异步按需加载

前面说过我们必须在 Server 端代码中将模块异步按需加载端代码替换成同步。medux 中控制模块同步或异步加载是在`src/modules/index.ts` 中：

```javascript
// 异步加载
export const moduleGetter = {
  app: () => {
    return import(/* webpackChunkName: "app" */ 'modules/app');
  },
  adminLayout: () => {
    return import(/* webpackChunkName: "adminLayout" */ 'modules/admin/adminLayout');
  },
  ...
};

// 替换为同步加载
export const moduleGetter = {
  app: () => {
    return require('modules/app');
  },
  adminLayout: () => {
    return require('modules/admin/adminLayout');
  },
  ...
};
```

只需要将`import`替换为`require`即可，当然这个简单的替换工作你可以使用本项目提供的一个简单的 webpack-loader 来完成：

> @medux/dev-utils/dist/webpack-loader/server-replace-async

它还支持用参数指定部分 module 替换，以减少 server 端 js 文件的大小，如：

```javascript
// build/webpack.config.js

{
  test: /\.(tsx|ts)?$/,
  use: [
    {
      loader: require.resolve('@medux/dev-utils/dist/webpack-loader/server-replace-async'),
      options: {modules: ['app', 'adminLayout', 'articleLayout', 'articleHome', 'articleAbout', 'articleService']},
    },
    {loader: 'babel-loader', options: {cacheDirectory: true, caller: {runtime: 'server'}}},
  ],
},
```

## 其它处理

使用很多细节大家直接看源码吧，有问题可以问我，欢迎共同探讨。

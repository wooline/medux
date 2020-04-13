![@medux](https://github.com/wooline/medux/blob/master/imgs/logo2.png)

## 关于@medux 系列

请先阅读：[@medux 系列概述](https://github.com/wooline/medux)

# 关于@medux/react-web-router

本包整合了@medux/core、@medux/web、@medux/route-plan-a、@medux/react ，是 web 环境下开发 reat 的开箱即用框架

本包已经包含了上述系列框架，你只需要安装和使用本包即可，无需重复安装其它@medux 系列

> npm install @medux/react-web-router

## 运行 Demo

- [medux-react-admin](https://github.com/wooline/medux-react-admin)：基于`@medux/react-web-router`和最新的`ANTD 4.x`开发的通用后台管理系统。

# Guides & API

## buildApp

该方法为 client 端创建并启动应用的入口方法

```TS
export declare function buildApp(
  options: {
    moduleGetter: ModuleGetter;
    appModuleName: string;
    history: History;
    routeConfig?: RouteConfig;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
    storeOptions?: StoreOptions;
    container?: string | Element | ((component: ReactElement<any>) => void);
    beforeRender?: (data: {
        store: Store<StoreState>;
        history: History;
        historyActions: HistoryActions;
        toBrowserUrl: ToBrowserUrl;
        transformRoute: TransformRoute;
    }) => Store<StoreState>;
}): Promise<void>;
```

- 参数：options: Object

  - moduleGetter: ModuleGetter; 模块的获取方式，支持同步或异步获取模块
  - appModuleName: string; 入口主模块的名称
  - history: History; 浏览器 history 对象，通常使用 History 库作为代理
  - routeConfig: RouteConfig; 路由配置
  - defaultRouteParams?: Obejct; 默认路由参数
  - storeOptions?: StoreOptions; Store 创建可选参数，参见[@medux/core/StoreOptions](https://github.com/wooline/medux/blob/master/packages/core/api/interfaces/storeoptions.md)
  - container?: string | Dom | Function; 将应用创建后的 Dom 挂载到页面容器里，如果为 sring 表示 ID，如果为 Dom 表示该 Dom，如果为回调函数挂载时将执行该函数
  - beforeRender?: Function 准备渲染前触发的钩子，此时 store 已经创建好，当然你可以修改或包装该 store。

- 返回 Promise 应用创建完成

使用示例：

```TS
const moduleGetter = {
  app: () => {
    return import('modules/app');
  },
  adminLayout: () => {
    return import('modules/adminLayout');
  },
  adminHome: () => {
    return import('modules/adminHome');
  },
};
export const routeConfig: RouteConfig = {
  '/$': '@./admin/home',
  '/': [
    'app.Main',
    {
      '/login': 'app.LoginPage',
      '/register': 'app.RegisterPage',
    }
  ]
};
export const defaultRouteParams = {
  app: {},
  adminLayout: {showMenu: true},
  adminHome: {}
};

buildApp({
  moduleGetter,
  appModuleName: 'app',
  history: createBrowserHistory(),
  routeConfig,
  defaultRouteParams,
  beforeRender: ({store, historyActions, toBrowserUrl, transformRoute}) => {
    //将某些单例作为全局对象保存起来
    window['historyActions'] = historyActions;
    window['toUrl'] = toBrowserUrl;
    window['transformRoute'] = transformRoute;
    return store;
  },
}).then(() => {
  const initLoading = document.getElementById('g-init-loading');
  initLoading && initLoading.parentNode!.removeChild(initLoading);
});
```

## buildSSR

该方法为 server 端创建并启动应用的入口方法

```TS
export declare function buildSSR(
  options: {
    moduleGetter: ModuleGetter;
    appModuleName: string;
    location: string;
    routeConfig?: RouteConfig;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
    storeOptions?: StoreOptions;
    renderToStream?: boolean;
    beforeRender?: (data: {
        store: Store<StoreState>;
        history: History;
        historyActions: HistoryActions;
        toBrowserUrl: ToBrowserUrl;
        transformRoute: TransformRoute;
    }) => Store<StoreState>;
}): Promise<{
    html: string | ReadableStream;
    data: any;
    ssrInitStoreKey: string;
}>;
```

- 参数：options: Object

  - moduleGetter: ModuleGetter; 模块的获取方式，支持同步或异步获取模块
  - appModuleName: string; 入口主模块的名称
  - location: string; server 端只支持 static 路由，不支持 history
  - routeConfig: RouteConfig 路由配置
  - defaultRouteParams?: Obejct 默认路由参数
  - storeOptions?: StoreOptions Store 创建可选参数，参见[@medux/core/StoreOptions](https://github.com/wooline/medux/blob/master/packages/core/api/interfaces/storeoptions.md)
  - renderToStream?: boolean; 是否使用流式渲染，参见 react/renderToNodeStream
  - beforeRender?: Function 准备渲染前触发的钩子，此时 store 已经创建好，当然你可以修改或包装该 store。

- 返回 Object
  - html: string | ReadableStream; server 端渲染得到的 html
  - data: any; server 端渲染得到的 state
  - ssrInitStoreKey: string; 传递 data 所使用的 ssrInitStoreKey

## LoadView

动态加载 View，并自动为其初始化相关的 model

```TS
export declare function LoadView(
  moduleName: string,
  viewName: string,
  options?: Options,
  onLoading?: ComponentType,
  onError?: ComponentType
): React.ComponentType
```

- 参数：moduleName: string; 要加载的 View 属于哪个模块名称
- 参数：viewName: string; 要加载的 view 名称
- 参数：options: Object; 加载选项
  - forwardRef?: boolean; 是否需要 ref 引用
- 参数：onLoading?: ComponentType; Loading 时怎么显示
- 参数：onError?: ComponentType; 发生错误时怎么显示

使用示例：

```JS
const RoleSelector = loadView('adminRole', 'Selector', {forwardRef: true});
```

## \<Switch\>

一个 React 组件，用来替代 react-router 的 \<Switch\>

使用示例：

```HTML
<Switch elseView={<NotFound />}>
  {routeViews.adminHome?.Main && <AdminHome />}
  {routeViews.adminRole?.List && <AdminRole />}
  {routeViews.adminMember?.List && <AdminMember />}
  {routeViews.adminPost?.List && <AdminPost />}
</Switch>
```

## \<Link\>

一个 React 组件，用来替代 react-router 的 \<Link\>

使用示例：

```HTML
<Link href={metaKeys.ArticleHomePathname}>
  <QuestionCircleOutlined /> 帮助指南
</Link>
```

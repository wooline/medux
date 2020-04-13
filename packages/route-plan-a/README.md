![@medux](https://github.com/wooline/react-coat/blob/master/docs/imgs/logo2.png)

欢迎您开始 @medux 之旅，建议您依次阅读以下 4 篇文章，这将耗费您大约 30 分钟。

- [为什么你需要 medux](https://github.com/wooline/medux)
- [medux 基础概念速览](https://github.com/wooline/medux/blob/master/docs/guides.md)
- [**medux 路由篇**](https://github.com/wooline/medux/tree/master/packages/route-plan-a)
- [medux 数据流](https://github.com/wooline/medux/blob/master/docs/data-flow.md)

第 3 篇：medux 路由

# 关于@medux/route-plan-a

本包实现一套基于 @medux/core 的跨平台路由方案，它可以将 web 的路由风格带入其它平台

上篇阐述了 medux 路由的基本思路，提到 medux 将路由及参数视为另一种 Store，它跟 Redux 的 Store 一样影响着 UI 的展示。medux 建议您在编写 component 时忘掉路由的概念。

## RouteData

通常路由解析及 history 功能由宿主平台提供，不同平台的路由方案不尽相同，medux 定义了统一通用的路由数据结构 `RouteData`，框架将自动把 `原生路由信息` 转换为 medux 使用的`RouteData`

```TS
interface RouteData {
    // views 表示当前路由下要展示哪些view
    views: {[moduleName: string]: {[viewName: string]: boolean}};
    // paths 表示当前路由下view的嵌套父子关系
    paths: string[];
    // params 表示当前路由保存(传递)了哪些状态
    params: {[moduleName: string]: {[key: string]: any}};
    // 当原生路由支持多history栈时，每个栈上分别保存(传递)了哪些状态
    // 常见的web或是小程序都只支持一个history栈，APP支持多栈
    stackParams: {[moduleName: string]: {[key: string]: any}}[];
}
```

## Location

我们暂且把宿主原生路由信息命名为 Location，例如在 web 环境中：

```TS
interface BrowserLocation {
    pathname: string;
    search: string;
    hash: string;
    state: any;
}
```

由于其中的 state 可能包含副作用，所以本方案将其排除，也就是说在本方案中“**你不能使用浏览器的 state 来存放数据**”，所以请忘掉 state 吧：

```TS
interface MeduxLocation {
    pathname: string;
    search: string;
    hash: string;
}
```

## RoutePayload

有的时候，我们需要基于当前 RouteData 并修改其中的某些值来创建一个 RouteData，这种情况下我们可以简化 RouteData 的书写

```TS
interface RoutePayload<P> {
    extend?: RouteData;// 基于一个RouteData
    params?: DeepPartial<P>;//修改其中的某些值
    paths?: string[];//修改其中的paths
}
```

## TransformRoute

本方案创建了一个转换器，在 Location 和 RouteData 之间转换

```TS
interface TransformRoute {
    locationToRoute: (location: MeduxLocation) => RouteData
    routeToLocation: (routeData: RouteData) => MeduxLocation;
}
```

## HistoryActions

我们都很熟悉 Web 中的历史记录操作，比如有 push、replace 等，既然 Location 和 RouteData 可以相互转换，那么相应的我们可以更灵活的使用它们。

```TS
interface HistoryActions<P = {}> {
    listen(listener: LocationListener): UnregisterCallback;
    getLocation(): MeduxLocation;
    getRouteData(): RouteData;
    push(data: RoutePayload  | MeduxLocation | string): void;
    replace(data: RoutePayload | MeduxLocation | string): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
}
```

## ToBrowserUrl

我们创建了一个方法直接将 RoutePayload 生成 url

```TS
interface ToBrowserUrl{
    (routeOptions: RoutePayload): string;
    (pathname: string, search: string, hash: string): string;
}
```

## RouteConfig

说了这么多，我们将 Location 与 RouteData 转换的规则是什么呢？这就是路由配置文件

```TS
interface RouteConfig {
    [path: string]: string | [string, RouteConfig];
}
```

代码示例：

```JS
const routeConfig = {
  '/$': '@./admin/home',
  '/': [
    'app.Main',
    {
      '/login': 'app.LoginPage',
      '/admin$': '@./admin/home',
      '/admin': [
        'adminLayout.Main',
        {
          '/admin/home': 'adminHome.Main',
          '/admin/role/:listView': [
            'adminRole.List',
            {
              '/admin/role/:listView/:itemView/:itemId': 'adminRole.Detail',
            },
          ],
        },
      ],
      '/article$': '@./article/home',
      '/article': [
        'articleLayout.Main',
        {
          '/article/home': 'articleHome.Main',
          '/article/about': 'articleAbout.Main',
        },
      ],
    },
  ],
};
```

RouteConfig 是一个递归对象，它的 key 表示匹配规则 rule，对应的值为 viewName 或者[viewName, RouteConfig]

- 当值为 viewName 时，表示如果当前 pathname 匹配了该 rule，就展示该 view，解析到此结束
- 当值为[viewName, RouteConfig]时，表示不仅要展示该 view，还要继续往下解析子级匹配
- viewName 通常使用 ModuleName.ViewName 格式
- 当 viewName 以@开头时，表示一个 redirect 跳转
- 当 rule 以\$结尾时，表示精确匹配，通常用来做重定向 redirect 跳转

假设当前 url 为 `/admin/role/list` 根据以上配置规则，可以解析得出 RouteData：

```JS
{
  views: {
    app: {Main: true},
    adminLayout: {Main: true},
    adminRole: {List: true},
  },
  paths: ['app.Main','adminLayout.Main','adminRole.List'],
  params: {
    app: {},
    adminLayout: {},
    adminRole: {listView: "list"}
  }
}
```

## 利用 pathname 传递参数

以上示例子中 params 参数：adminRole: {listView: "list"}来自于 pathname 对 rule `/admin/role/:listView`的匹配。 所以 pathname 中可以传递参数，它们会被提取到 params 中，而 params 则会以 moduleName 作为命名空间。

那如果将 RouteConfig 中规则 `/admin/role/:listView` 改为 `/admin/role/:listView.name`，解析后你会看到这样的变化：

> adminRole: {listView: "list"} 变成了 adminRole: {listView: {name: "list"}}

也就是说 path 中不仅可以传递的参数，还可以结构化，可以多层级。

## 利用 search string 传递参数

利用 pathname 只能传递简单的 string 参数。我们知道通常 url 中传递参数是利用 search，比如 /admin/role/list?title=medux&page=1&pagesize=20

在本方案中我们也可以利用 search 来传递复杂参数，只不过是直接将 json 字符串放入 search 参数中，比如：

> /admin/role/list?q={adminRole: {title: "medux", page: 1, pageSize: 20}}

## 利用 hash string 传递私有参数

本方案中 hash 也跟 search 一样可以传递复杂参数，但是由于它不会被浏览器发送到服务器，所以我们专门用来存储一些**带下划线私有参数**，例如：

> /admin/role/list?q={adminRole: {title: "medux", page: 1, pageSize: 20}}#q={adminRole: {\_random: 34532324}}

- hash 中参数方式传递与 search 一样
- hash 专门用来传递不发往服务器的私有数据，所以强制其数据名使用`_`前缀

## 利用 defaultParams 传递默认参数

我们还可以为每个 module 预先定义一组参数的默认值，比如：

```JS
{
  adminRole: {
    page: 1,
    pageSize: 20,
    sortBy: "createTime"
  }
}
```

## 合并各路参数

所以依据本方案，pathname、search、hash、defaultParams 都可以传递结构化的参数，最终它们会被合并放入 RouteData 的 params 中，所以最终你可以看到的 RouteData 如下

```JS
{
  views: {
    app: {Main: true},
    adminLayout: {Main: true},
    adminRole: {List: true},
  },
  paths: ['app.Main','adminLayout.Main','adminRole.List'],
  params: {
    app: {},
    adminLayout: {},
    adminRole: {
      listView: "list",
      title: "medux",
      page: 1,
      pageSize: 20,
      sortBy: "createTime",
      _random: 34532324
    }
  }
}
```

## RouteData 转换为 Location

以上阐述的是怎么将一个 Location 转换为 RouteData，那么反过来自然也可将 RouteData 转换为 Location。

- 由于 RouteData 中的 views 其实可以利用 paths 求出，所以 views 其实可以省略不传
- params 中带`_`前缀的数据项会自动放入 hash 中
- **与默认参数相同的数据项会被排除**

```JS
const url = toBrowserUrl({
  paths: ['app.Main','adminLayout.Main','adminRole.List'],
  params: {
    adminRole: {
      listView: "list", //被pathname匹配到的数据项会放入pathname
      title: "medux",
      page: 1, //与默认参数相同的数据项将会被排除
      pageSize: 20, //与默认参数相同的数据项将会被排除
      sortBy: "createTime",//与默认参数相同的数据项将会被排除
      _random: 34532324 //带_的数据项将放入hash中
    }
  }
})
```

所以以上代码将得到：

> /admin/role/list?q={adminRole: {title: "medux"}}#q={adminRole: {\_random: 34532324}}

## 忘掉路由，一切都是 state

可以看到我们的 RouteData 中的 params 都是以 moduleName 作为命名空间的，因为我们本来就希望将 Route 视为一个 Store。现在让我们把 RouteState 合并到 ReduxState 中，并将 params 注入到 moduleState 中，最终的 RootState 可能是这样

```JS
{
  route: {
    location: {
      pathname: "/admin/role/list",
      search: '?q={adminRole: {title: "medux"}}',
      hash: '#q={adminRole: {_random: 34532324}}'
    },
    data: {
      views: {
        app: {Main: true},
        adminLayout: {Main: true},
        adminRole: {List: true},
      },
      paths: ['app.Main','adminLayout.Main','adminRole.List'],
      params: {
        app: {},
        adminLayout: {},
        adminRole: {
          listView: "list",
          title: "medux",
          page: 1,
          pageSize: 20,
          sortBy: "createTime",
          _random: 34532324
        }
      }
    }
  },
  app: {
    routeParams: {},
    ...
  },
  adminLayout: {
    routeParams: {},
    ...
  },
  adminRole: {
    routeParams: { // 已经将RouteState中的状态注入到对应的模块中
      listView: "list",
      title: "medux",
      page: 1,
      pageSize: 20,
      sortBy: "createTime",
      _random: 34532324
    },
    ...
  }
}
```

那么此时，你在 Component 里面使用 moduleState 时已经不需要思考它的来源是哪里了，也许是路由解析得出的，但也没准是内部 dispatch action 得到的呢

## 继续阅读下一篇

[medux 数据流](https://github.com/wooline/medux/blob/master/docs/data-flow.md)

## Core API

[**@medux/core**](https://github.com/wooline/medux/tree/master/packages/core)：@medux 系列的核心基础包.[查看 API](https://github.com/wooline/medux/tree/master/packages/core/api)

# 废话少说，直接上 Demo

[medux-react-admin](https://github.com/wooline/medux-react-admin)：基于`@medux/react-web-router`和最新的`ANTD 4.x`开发的通用后台管理系统。

**欢迎批评指正，觉得还不错的别忘了给个`Star` >\_<，如有错误或 Bug 请反馈**

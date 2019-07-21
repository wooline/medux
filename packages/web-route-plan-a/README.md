## 关于@medux

请先阅读：[@medux 概述](https://github.com/wooline/medux)

## 关于@medux/core

请先阅读：[@medux/core 概述](https://github.com/wooline/medux/tree/master/packages/core)

# 关于@medux/web-route-plan-a

基于`@medux/web`，是一套具体的路由序列化和反序列化方案

## 回顾一下@medux/core 中的抽象路由

不同平台，不同 UI 框架有着各种不同的路由方案，我们抽象的思考一下，路由的本质是什么？

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

### 路由通常包含 3 种 UI 状态信息

不管我们使用什么方案，通常我们能从路由状态中解析出以下信息：

> 以 web 路由为例，假设有 URL：/photos/32/comments?params={comments:{listSearch:{sortBy: "datetime",page:1,pageSize:20}}} 当前页面上显示的是图片 id 为 32 的详情，并且同时展示了相关评论列表

- `paths`：string[] 描述当前界面中 View 的层级嵌套。比如：[app.Main, photos.Details, comments.List]
- `views`：{[moduleName:string]:{[viewName:string]:boolean}} 通过上面`paths`能分析出当前界面展示了哪些模块的哪些 view，比如：

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
  // 我们的 State 是按 module 组织的，各个 module 维护自已的状态
  // 所以同样对于 RouteState，也是按 module 组织的
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

其中的 params 是分 module 来维护的，它也是 moduleState 的一部分，所以它最终会合并到 moduleState 中，于是我们这样定义 BaseModuleState：

```JS
interface BaseModelState<RouteParams> {
  routeParams?: RouteParams;
}
```

所以看起来路由参数 params 被存了 2 份，一份是顶层的 RouteData 中，另一份则是被合并到了各个 Module 的 routeParams 中。这 2 份数据有什么不同的意义呢？

- RouteData 中的 params 表示用户预想的目标状态，比如用户想翻到第 2 页，此时 RouteData.params.photos.page 会等于 2，这一部分是先变的。但是有时由于各种原因目标并不能顺利达成，比如网络断了，此时该怎么描述状态呢？
- Module 中的 routeParams 则是表示有效的当前状态，如果翻页成功了它的 page 变成 2，如果失败则不变。
- 简单来说就是，顶层路由中的 params 反映目标，而 module 中的 params 反映当前实际。只有确定目标执行成功了，才能将其 update 为与目标一致的状态。

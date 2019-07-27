## 关于@medux

请先阅读：[@medux 概述](https://github.com/wooline/medux)

## 关于@medux/core

请先阅读：[@medux/core 概述](https://github.com/wooline/medux/tree/master/packages/core)

## 关于@medux/web

请先阅读：[@medux/web 概述](https://github.com/wooline/medux/tree/master/packages/web)

# 关于@medux/web-route-plan-a

本库基于`@medux/web`，是一套具体的路由序列化和反序列化方案，主要体现在：

- 将 RouteData.params 直接用 JSON 的格式序列化为 URL Search 参数
- 将 RouteData.params 中带`_前缀`的数据用 JSON 的格式序列化为 URL Hash 参数
- 由于 JSON 无法表达日期类型，所以本库自动将符合`ISO_DATE_FORMAT`格式的字符串反序化为日期
- 使用 RouteConfig 来定义与匹配 pathname 和其中的传参，例如：

```JS
export const routeConfig: RouteConfig = {
  '/': [
    appMain,
    {
      '/photos': photosList,
      '/photos/:itemId': [
        photosDetails,
        {
          '/:articleType/:articleId/comments': commentsMain,
        },
      ],
      '/messages': messagesList,
    },
  ],
};
```

- 将 RouteData.params 定义一套默认值，路由入参时会自动 merge 加上默认值，出参时如果与默认值相同则省去，主要为了节省 URL 长度。

> 样例 URL：/photos/32/comments?q={comments:{listSearch:{sortBy: "datetime",page:1,pageSize:20}}} 当前页面上显示的是图片 id 为 32 的详情，并且同时展示了相关评论列表

注意到评论列表的查询条件为：

> `comments:{listSearch:{sortBy: "datetime",page:1,pageSize:20}}`

如果我们事先定义了默认值为：

> `comments:{listSearch:{sortBy: "datetime",page:1,pageSize:20}}`

那么时此 url 会自动省去默认值而缩短为：

> `/photos/32/comments`

如果用户翻到第 2 页，则变成：

> `comments:{listSearch:{page:2}}`

## 查看 Demo

- [medux-demo-spa](https://github.com/wooline/medux-demo-spa)

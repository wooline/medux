## 关于@medux

请先阅读：[@medux 概述](https://github.com/wooline/medux)

## 关于@medux/core

请先阅读：[@medux/core 概述](https://github.com/wooline/medux/tree/master/packages/core)

# 关于@medux/web

本库基于`@medux/core`，是其与 Web 环境的结合，主要实现了@medux/core 中的抽象路由接口：

```JS
interface HistoryProxy<L = any> {
  getLocation(): L; //获取第三方路由状态
  subscribe(listener: (location: L) => void): void; //定阅第三方路由的改变
  locationToRouteData(location: L): RouteData; //将第三方路由状态转变为RouteData
  equal(a: L, b: L): boolean;// 比较两个路由状态（用于TimeTravelling）
  patch(location: L, routeData: RouteData): void; //同步第三方路由（用于TimeTravelling）
}
```

## 查看 Demo

- [medux-demo-spa](https://github.com/wooline/medux-demo-spa)

![@medux](https://cdn.nlark.com/yuque/0/2020/png/1294343/1587132905898-334d9af9-7d0b-4b40-861a-45abf17bd1f8.png)

欢迎您开始 @medux 之旅，建议您依次阅读以下 4 篇文章，这将耗费您大约 30 分钟。

- 为什么你需要 medux: [掘金](https://juejin.im/post/5e9c6fc06fb9a03c8f6cba50) | [语雀](https://www.yuque.com/medux/docs/01)
- medux 基础概念速览: [掘金](https://juejin.im/post/5e9c7b576fb9a03c341db536) | [语雀](https://www.yuque.com/medux/docs/02)
- medux 路由篇: [掘金](https://juejin.im/post/5e9c8bebe51d4546b90d2d3a) | [语雀](https://www.yuque.com/medux/docs/03)
- medux 数据流: [掘金](https://juejin.im/post/5e9c8ebb51882573c46792a7) | [语雀](https://www.yuque.com/medux/docs/04)

## @medux 包含以下 Packages

- [**@medux/core**](https://github.com/wooline/medux/tree/master/packages/core)：核心基础包
- [**@medux/web**](https://github.com/wooline/medux/tree/master/packages/web)：让 @medux/core 具有 web 特性，主要体现在 History 管理上
- [**@medux/route-plan-a**](https://github.com/wooline/medux/tree/master/packages/route-plan-a)：实现一套基于 @medux/core 的跨平台路由方案，它将 web 的路由风格带入其它平台
- [**@medux/react**](https://github.com/wooline/medux/tree/master/packages/react)：@medux/core 结合 React 的封装
- [**@medux/react-web-router**](https://github.com/wooline/medux/tree/master/packages/react-web-router)：整合封装了@medux/core、@medux/web、@medux/route-plan-a、@medux/react, 是 web 环境下开发 react 的开箱即用框架

以下是尚未完成的 Packages：

- **@medux/vue-web-router**：@medux/core 结合 VUE，思路很简单，在 Reducer 中直接修改 ModuleState 然后返回它
- **@medux/react-native-router**：@medux/core 结合 ReactNative

## CoreAPI

[查看 CoreAPI 文档](https://github.com/wooline/medux/tree/master/packages/core/api)

## Demo

[medux-react-admin](https://github.com/wooline/medux-react-admin)：基于`@medux/react-web-router`和最新的`ANTD 4.x`开发的通用后台管理系统，除了演示 medux 怎么使用，它还创造了不少独特的理念

---

**欢迎批评指正，觉得还不错的别忘了给个`Star` >\_<，如有错误或 Bug 请反馈**

- [掘金专栏](https://juejin.im/user/5e97cb9df265da47fe1dfbc8/posts)
- [语雀专栏](https://www.yuque.com/medux/docs)

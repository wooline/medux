![@medux](https://cdn.nlark.com/yuque/0/2020/png/1294343/1587132905898-334d9af9-7d0b-4b40-861a-45abf17bd1f8.png)

欢迎您开始 @medux 之旅，建议您依次阅读以下 4 篇文章，这将耗费您大约 30 分钟。

- 为什么你需要 medux: [掘金](https://juejin.im/post/5e9ea2faf265da480003bce7) | [知乎](https://zhuanlan.zhihu.com/p/139621146) |[语雀](https://www.yuque.com/medux/docs/01)
- medux 基础概念速览: [掘金](https://juejin.im/post/5e9ea37d6fb9a03c880f5d6d) | [知乎](https://zhuanlan.zhihu.com/p/139628366) | [语雀](https://www.yuque.com/medux/docs/02)
- medux 路由篇: [掘金](https://juejin.im/post/5e9ea3f4f265da47ad21a635) | [知乎](https://zhuanlan.zhihu.com/p/139629378) | [语雀](https://www.yuque.com/medux/docs/03)
- medux 数据流: [掘金](https://juejin.im/post/5e9ea471f265da480c033424) | [知乎](https://zhuanlan.zhihu.com/p/139633499) | [语雀](https://www.yuque.com/medux/docs/04)

## @medux 包含以下 Packages

- [**@medux/core**](https://github.com/wooline/medux/tree/master/packages/core)：核心基础包
- [**@medux/web**](https://github.com/wooline/medux/tree/master/packages/web)：让 @medux/core 具有 web 特性，主要体现在 History 管理上
- [**@medux/route-plan-a**](https://github.com/wooline/medux/tree/master/packages/route-plan-a)：实现一套基于 @medux/core 的跨平台路由方案，它将 web 的路由风格带入其它平台
- [**@medux/react**](https://github.com/wooline/medux/tree/master/packages/react)：@medux/core 结合 React 的封装
- [**@medux/react-web-router**](https://github.com/wooline/medux/tree/master/packages/react-web-router)：整合封装了@medux/core、@medux/web、@medux/route-plan-a、@medux/react, 是 web 环境下开发 react 的开箱即用框架
- [**@medux/wechat**](https://github.com/wooline/medux/tree/master/packages/wechat)：整合封装了@medux/core、@medux/route-plan-a，是开发微信小程序的利器
- [**@medux/wechat-redux-devtools**](https://github.com/wooline/medux/tree/master/packages/wechat-redux-devtools)：在微信小程序环境下使用 redux-devtools

以下是尚未完成的 Packages：

- **@medux/vue-web-router**：@medux/core 结合 VUE，思路很简单，在 Reducer 中直接修改 ModuleState 然后返回它
- **@medux/react-native-router**：@medux/core 结合 ReactNative

## CoreAPI

[查看 CoreAPI 文档](https://github.com/wooline/medux/tree/master/packages/core/api)

## Demo

[medux-react-admin](https://github.com/wooline/medux-react-admin)：基于`@medux/react-web-router`和最新的`ANTD 4.x`开发的通用后台管理系统，除了演示 medux 怎么使用，它还创造了不少独特的理念

[medux-react-ssr](https://github.com/wooline/medux-react-ssr)：Fork 自 `medux-react-admin`，将其改造为服务器同构渲染，你可以看到如何将一个 SinglePage(单页应用) 快速转换为支持 SEO 的多页应用。

---

**欢迎批评指正，觉得还不错的别忘了给个`Star` >\_<，如有错误或 Bug 请反馈**

- [知乎专栏](https://zhuanlan.zhihu.com/c_1236981351188373504)
- [掘金专栏](https://juejin.im/user/5e97cb9df265da47fe1dfbc8/posts)
- [语雀专栏](https://www.yuque.com/medux/docs)

![@medux](https://cdn.nlark.com/yuque/0/2020/png/1294343/1587132905898-334d9af9-7d0b-4b40-861a-45abf17bd1f8.png)

欢迎您开始 @medux 之旅，建议您依次阅读以下 4 篇文章，这将耗费您大约 30 分钟。

- 为什么你需要 medux: [掘金](https://juejin.im/post/5e9ea2faf265da480003bce7) | [知乎](https://zhuanlan.zhihu.com/p/139621146) |[语雀](https://www.yuque.com/medux/docs/01)
- medux 基础概念速览: [掘金](https://juejin.im/post/5e9ea37d6fb9a03c880f5d6d) | [知乎](https://zhuanlan.zhihu.com/p/139628366) | [语雀](https://www.yuque.com/medux/docs/02)
- medux 路由篇: [掘金](https://juejin.im/post/5e9ea3f4f265da47ad21a635) | [知乎](https://zhuanlan.zhihu.com/p/139629378) | [语雀](https://www.yuque.com/medux/docs/03)
- medux 数据流: [掘金](https://juejin.im/post/5e9ea471f265da480c033424) | [知乎](https://zhuanlan.zhihu.com/p/139633499) | [语雀](https://www.yuque.com/medux/docs/04)

## @medux 包含以下开发包：

- [**@medux/core**](https://github.com/wooline/medux/tree/master/packages/core)：核心基础包
- [**@medux/route-web**](https://github.com/wooline/medux/tree/master/packages/route-web)：抽象 web 风格的路由，使其能应用到跨平台
- [**@medux/route-browser**](https://github.com/wooline/medux/tree/master/packages/route-browser)：基于浏览器环境实现@medux/route-web
- [**@medux/route-mp**](https://github.com/wooline/medux/tree/master/packages/route-mp)：基于各种小程序环境实现@medux/route-web
- [**@medux/react-web-router**](https://github.com/wooline/medux/tree/master/packages/react-web-router)：整合封装了@medux/core、@medux/route-web、@medux/route-browser，并使用 react 做 UI 框架，适合 web 开发（如：后台管理系统、H5、单页应用、多页应用、SSR 服务器同构渲染）
- [**@medux/react-taro-router**](https://github.com/wooline/medux/tree/master/packages/react-taro-router)：整合封装了@medux/core、@medux/route-web、@medux/route-mp，并使用 tarojs+react 做 UI 框架，适合各种小程序及跨平台开发（跨平台技术由 tarojs 提供）

## @medux 包含以下开发工具：

- [**@medux/dev-utils**](https://github.com/wooline/medux/tree/master/packages/dev-utils)：常用的开发工具
- [**@medux/dev-webpack**](https://github.com/wooline/medux/tree/master/packages/dev-webpack)：基于 webpack 的 loader 与 plugin
- [**@medux/babel-preset-recommended**](https://github.com/wooline/medux/tree/master/packages/babel-preset-recommended)：本站推荐的 babel 设置
- [**@medux/eslint-plugin-recommended**](https://github.com/wooline/medux/tree/master/packages/eslint-plugin-recommended)：本站推荐的 eslint 设置
- [**@medux/stylelint-config-recommended**](https://github.com/wooline/medux/tree/master/packages/stylelint-config-recommended)：本站推荐的 stylelint 设置
- [**@medux/wechat-redux-devtools**](https://github.com/wooline/medux/tree/master/packages/wechat-redux-devtools)：在微信小程序环境下使用 redux-devtools
- [**@medux/dev-pkg**](https://github.com/wooline/medux/tree/master/packages/dev-pkg)：常用开发依赖
- [**@medux/dev-pkg-taro**](https://github.com/wooline/medux/tree/master/packages/dev-pkg-taro)：常用开发依赖（使用 tarojs 脚手架）

以下是尚未完成的 Packages：

- **@medux/react-native-router**：@medux/core 结合 ReactNative

## CoreAPI

[查看 CoreAPI 文档](https://github.com/wooline/medux/tree/master/packages/core/api)

## Demo 及案例

- [react-redux-spa](https://github.com/wooline/medux-demo-freestyle/tree/main/react-redux-spa)：web 单页应用 demo
- [ssr-react-redux-spa](https://github.com/wooline/medux-demo-freestyle/tree/main/ssr-react-redux-spa)：web 单页应用+SSR 服务端同构 demo
- [react-redux-admin](https://github.com/wooline/medux-demo-freestyle/tree/main/react-redux-admin)：web 单页应用-后台管理系统
- [react-redux-taro](https://github.com/wooline/medux-demo-freestyle/tree/main/react-redux-taro)：基于 tarojs 开发多端小程序
- [medux-react-admin](https://github.com/wooline/medux-react-admin)：基于`@medux/react-web-router`和最新的`ANTD 4.x`开发的通用后台管理系统，除了演示 medux 怎么使用，它还创造了不少独特的理念
- [medux-react-ssr](https://github.com/wooline/medux-react-ssr)：Fork 自以上 medux-react-admin，将其改造为**服务器同构渲染**，你可以看到如何将一个 SinglePage(`单页应用`)快速转换为支持 SEO 的多页应用。
- [medux-wechat-native](https://github.com/wooline/medux-wechat-native)：基于@medux/wechat，用原生语言开发微信小程序

---

**欢迎批评指正，觉得还不错的别忘了给个`Star` >\_<，如有错误或 Bug 请反馈**

- [知乎专栏](https://zhuanlan.zhihu.com/c_1236981351188373504)
- [掘金专栏](https://juejin.im/user/5e97cb9df265da47fe1dfbc8/posts)
- [语雀专栏](https://www.yuque.com/medux/docs)

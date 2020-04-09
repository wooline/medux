## 兼容性

支持 IE8 及以上现代浏览器。IE11 及以下浏览器请自行加入`polyfill`，并使用 src 目录的 TS 源码重新编译。

- 对于不支持 proxy 对象的浏览器，需要手动加载 model，参见 loadModel
- 对于 IE8 不支持 getter，请在 ModelHandlers 中请使用 this.getState()来获取 moduleState，而不是使用 this.state。
- 对于不能同时支持转码 decorators 和 count property 的环境时，可以将 ActionType 的 module 分隔符由 "`/`" 改为 "`_`"、将多 ActionType 分隔符由 "`,`" 改为 "`$`"，从而避免使用特殊字符命名类的方法，例如：

```JS
  //同时监听本模块的Init和RouteChange，默认使用count property写法：
  @effect(null)
  protected async ['this.Init,medux.RouteChange']() {
    ...
  }

  //可以改为普通写法：
  import {setConfig} from "@medux/core";
  setConfig({ NSP: "_", MSP: "$" });
  ...
  @effect(null)
  protected async this_Init$medux_RouteChange() {
    ...
  }
```

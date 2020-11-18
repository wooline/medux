[@medux/core - v1.1.1-alpha.1](README.md)

# @medux/core - v1.1.1-alpha.1

## Index

### Enumerations

- [LoadingState](enums/loadingstate.md)

### Classes

- [BaseModelHandlers](classes/basemodelhandlers.md)

### Interfaces

- [Action](interfaces/action.md)
- [BaseModelState](interfaces/basemodelstate.md)
- [CommonModule](interfaces/commonmodule.md)
- [DisplayViews](interfaces/displayviews.md)
- [HistoryProxy](interfaces/historyproxy.md)
- [Model](interfaces/model.md)
- [Module](interfaces/module.md)
- [ModuleGetter](interfaces/modulegetter.md)
- [RouteData](interfaces/routedata.md)
- [RouteState](interfaces/routestate.md)
- [StoreOptions](interfaces/storeoptions.md)

### Type aliases

- [Actions](README.md#actions)
- [ExportModule](README.md#exportmodule)
- [LoadView](README.md#loadview)
- [RootState](README.md#rootstate)
- [RouteViews](README.md#routeviews)
- [StoreState](README.md#storestate)

### Variables

- [client](README.md#const-client)
- [env](README.md#const-env)
- [isDevelopmentEnv](README.md#const-isdevelopmentenv)
- [isServerEnv](README.md#const-isserverenv)

### Functions

- [cacheModule](README.md#cachemodule)
- [delayPromise](README.md#delaypromise)
- [effect](README.md#effect)
- [errorAction](README.md#erroraction)
- [exportActions](README.md#exportactions)
- [exportModule](README.md#const-exportmodule)
- [getActionData](README.md#getactiondata)
- [getClientStore](README.md#getclientstore)
- [getView](README.md#getview)
- [isPromiseModule](README.md#ispromisemodule)
- [isPromiseView](README.md#ispromiseview)
- [isServer](README.md#isserver)
- [loadModel](README.md#loadmodel)
- [logger](README.md#logger)
- [modelHotReplacement](README.md#modelhotreplacement)
- [reducer](README.md#reducer)
- [renderApp](README.md#renderapp)
- [renderSSR](README.md#renderssr)
- [routeChangeAction](README.md#routechangeaction)
- [routeParamsAction](README.md#routeparamsaction)
- [setConfig](README.md#setconfig)
- [setLoading](README.md#setloading)
- [setLoadingDepthTime](README.md#setloadingdepthtime)
- [viewHotReplacement](README.md#viewhotreplacement)

### Object literals

- [ActionTypes](README.md#const-actiontypes)
- [config](README.md#const-config)

## Type aliases

### Actions

Ƭ **Actions**: _object_

将 ModelHandlers 变成 Action Creator

- 该数据结构由 ExportModule 自动生成
- medux 中的 action 通常都由此 Creator 自动生成

#### Type declaration:

---

### ExportModule

Ƭ **ExportModule**: _function_

导出 Module

**`param`** 模块名，不能重复

**`param`** 模块初始状态

**`param`** 模块的 ModelHandlers 类，必须继承 BaseModelHandlers

**`param`** 模块需要导出给外部使用的 View，若无需给外部使用可不导出

**`returns`** medux 定义的 module 标准数据结构

#### Type declaration:

▸ <**S**, **V**, **T**, **N**>(`moduleName`: N, `initState`: S, `ActionHandles`: object, `views`: V): _Module<Model&lt;S&gt;, V, Actions&lt;T&gt;, N>["default"]_

**Type parameters:**

▪ **S**: _[BaseModelState](interfaces/basemodelstate.md)_

▪ **V**: _object_

▪ **T**: _[BaseModelHandlers](classes/basemodelhandlers.md)‹S, any›_

▪ **N**: _string_

**Parameters:**

▪ **moduleName**: _N_

▪ **initState**: _S_

▪ **ActionHandles**: _object_

| Name          | Type |
| ------------- | ---- |
| `constructor` |      |

▪ **views**: _V_

---

### LoadView

Ƭ **LoadView**: _function_

动态加载 View，因为每种 UI 框架动态加载 View 的方式不一样，所有此处只是提供一个抽象接口

**`see`** getView

#### Type declaration:

▸ <**M**, **V**, **N**>(`moduleName`: M, `viewName`: N, `options?`: Options, `loading?`: Comp, `error?`: Comp): _V[N]_

**Type parameters:**

▪ **M**: _Extract‹keyof MG, string›_

▪ **V**: _ModuleViews‹ReturnModule‹MG[M]››_

▪ **N**: _Extract‹keyof V, string›_

**Parameters:**

| Name         | Type    |
| ------------ | ------- |
| `moduleName` | M       |
| `viewName`   | N       |
| `options?`   | Options |
| `loading?`   | Comp    |
| `error?`     | Comp    |

---

### RootState

Ƭ **RootState**: _object & object_

整个 Store 的数据结构模型，主要分为三部分

- route，路由数据
- modules，各个模块的数据，可通过 isModule 辨别
- otherReducers，其他第三方 reducers 生成的数据

---

### RouteViews

Ƭ **RouteViews**: _object_

描述当前路由下展示了哪些 views

#### Type declaration:

---

### StoreState

Ƭ **StoreState**: _object & object_

medux 使用的 Store 数据模型结构

## Variables

### `Const` client

• **client**: _ENV | undefined_ = isServerEnv ? undefined : env

---

### `Const` env

• **env**: _ENV_ = (typeof window === 'object' && window.window) || (typeof global === 'object' && global.global) || global

---

### `Const` isDevelopmentEnv

• **isDevelopmentEnv**: _boolean_ = process.env.NODE_ENV !== 'production'

---

### `Const` isServerEnv

• **isServerEnv**: _boolean_ = typeof window === 'undefined' && typeof global === 'object' && global.global === global

## Functions

### cacheModule

▸ **cacheModule**<**T**>(`module`: T): _function_

**Type parameters:**

▪ **T**: _[CommonModule](interfaces/commonmodule.md)_

**Parameters:**

| Name     | Type |
| -------- | ---- |
| `module` | T    |

**Returns:** _function_

▸ (): _T_

---

### delayPromise

▸ **delayPromise**(`second`: number): _(Anonymous function)_

一个类方法的装饰器，将其延迟执行

- 可用来装饰 effectHandler
- 也可以装饰其他类

**Parameters:**

| Name     | Type   | Description |
| -------- | ------ | ----------- |
| `second` | number | 延迟秒数    |

**Returns:** _(Anonymous function)_

---

### effect

▸ **effect**(`loadingForGroupName?`: string | null, `loadingForModuleName?`: undefined | string): _(Anonymous function)_

一个类方法的装饰器，用来指示该方法为一个 effectHandler

- effectHandler 必须通过 dispatch Action 来触发

**Parameters:**

| Name                    | Type                    | Description                                                                                                                                                                  |
| ----------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loadingForGroupName?`  | string &#124; null      | 注入加载状态的分组 key，默认为 global，如果为 null 表示不注入加载状态                                                                                                        |
| `loadingForModuleName?` | undefined &#124; string | 可将 loading 状态合并注入到其他 module，默认为入口主模块 `effect(null) 不注入加载状态 effect() == effect('global','app') effect('global') = effect('global',thisModuleName)` |

**Returns:** _(Anonymous function)_

---

### errorAction

▸ **errorAction**(`error`: any): _object_

框架定义的全局错误 ActionCreator，拥有固定的 type

**Parameters:**

| Name    | Type | Description |
| ------- | ---- | ----------- |
| `error` | any  | 错误        |

**Returns:** _object_

- **payload**: _any[]_ = [error]

- **type**: _string_ = ActionTypes.Error

---

### exportActions

▸ **exportActions**<**G**>(`moduleGetter`: G): _object_

为所有模块的 modelHanders 自动生成 ActionCreator

- 注意如果环境不支持 ES7 Proxy，将无法 dispatch 一个未经初始化的 ModelAction，此时必须手动提前 loadModel
- 参见 loadModel

**Type parameters:**

▪ **G**: _object_

**Parameters:**

| Name           | Type | Description    |
| -------------- | ---- | -------------- |
| `moduleGetter` | G    | 模块的获取方式 |

**Returns:** _object_

---

### `Const` exportModule

▸ **exportModule**(`moduleName`: N, `initState`: S, `ActionHandles`: object, `views`: V): _object_

导出 Module，该方法为 ExportModule 接口的实现

**Parameters:**

▪ **moduleName**: _N_

模块名，不能重复

▪ **initState**: _S_

模块初始状态

▪ **ActionHandles**: _object_

模块的 ModelHandlers 类，必须继承 BaseModelHandlers

| Name          | Type |
| ------------- | ---- |
| `constructor` |      |

▪ **views**: _V_

模块需要导出给外部使用的 View，若无需给外部使用可不导出

**Returns:** _object_

medux 定义的 module 标准数据结构

- **actions**: _any_

- **model**: _model_

- **moduleName**: _N_

- **views**: _V_

---

### getActionData

▸ **getActionData**(`action`: [Action](interfaces/action.md)): _any[]_

从 redux action 上获取有效数据载体

**Parameters:**

| Name     | Type                           | Description     |
| -------- | ------------------------------ | --------------- |
| `action` | [Action](interfaces/action.md) | redux 的 action |

**Returns:** _any[]_

---

### getClientStore

▸ **getClientStore**(): _ModuleStore_

在 client 中运行时，全局只有一个单例的 Store 对象，可通过该方法直接获得

**Returns:** _ModuleStore_

---

### getView

▸ **getView**<**T**>(`moduleName`: string, `viewName`: string, `modelOptions?`: any): _T | Promise‹T›_

动态获取 View，与 LoadView 的区别是：

- getView 仅获取 view，并不渲染，与 UI 平台无关
- LoadView 内部会调用 getView 之后会渲染 View
- getView 会自动加载并初始化该 view 对应的 model

**Type parameters:**

▪ **T**

**Parameters:**

| Name            | Type   |
| --------------- | ------ |
| `moduleName`    | string |
| `viewName`      | string |
| `modelOptions?` | any    |

**Returns:** _T | Promise‹T›_

---

### isPromiseModule

▸ **isPromiseModule**(`module`: [Module](interfaces/module.md) | Promise‹[Module](interfaces/module.md)›): _module is Promise&lt;Module&gt;_

通过 moduleGetter 获得的 module 可能是同步的也可能是异步的，此方法用来判断

**Parameters:**

| Name     | Type                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| `module` | [Module](interfaces/module.md) &#124; Promise‹[Module](interfaces/module.md)› |

**Returns:** _module is Promise&lt;Module&gt;_

---

### isPromiseView

▸ **isPromiseView**<**T**>(`moduleView`: T | Promise‹T›): _moduleView is Promise&lt;T&gt;_

通过 getView 获得的 view 可能是同步的也可能是异步的，此方法用来判断

**Type parameters:**

▪ **T**

**Parameters:**

| Name         | Type                |
| ------------ | ------------------- |
| `moduleView` | T &#124; Promise‹T› |

**Returns:** _moduleView is Promise&lt;T&gt;_

---

### isServer

▸ **isServer**(): _boolean_

**Returns:** _boolean_

---

### loadModel

▸ **loadModel**<**MG**>(`moduleName`: Extract‹keyof MG, string›, `storeInstance?`: ModuleStore, `options?`: any): _void | Promise‹void›_

动态加载并初始化其他模块的 model

**Type parameters:**

▪ **MG**: _[ModuleGetter](interfaces/modulegetter.md)_

**Parameters:**

| Name             | Type                      | Description                                   |
| ---------------- | ------------------------- | --------------------------------------------- |
| `moduleName`     | Extract‹keyof MG, string› | 要加载的模块名                                |
| `storeInstance?` | ModuleStore               | -                                             |
| `options?`       | any                       | model 初始化时可以传入的数据，参见 Model 接口 |

**Returns:** _void | Promise‹void›_

---

### logger

▸ **logger**(`before`: function, `after`: null | function): _(Anonymous function)_

一个类方法的装饰器，用来向 reducerHandler 或 effectHandler 中注入 before 和 after 的钩子

- 注意不管该 handler 是否执行成功，前后钩子都会强制执行

**Parameters:**

▪ **before**: _function_

actionHandler 执行前的钩子

▸ (`action`: [Action](interfaces/action.md), `moduleName`: string, `promiseResult`: Promise‹any›): _void_

**Parameters:**

| Name            | Type                           |
| --------------- | ------------------------------ |
| `action`        | [Action](interfaces/action.md) |
| `moduleName`    | string                         |
| `promiseResult` | Promise‹any›                   |

▪ **after**: _null | function_

actionHandler 执行后的钩子

**Returns:** _(Anonymous function)_

---

### modelHotReplacement

▸ **modelHotReplacement**(`moduleName`: string, `initState`: any, `ActionHandles`: object): _void_

当 model 发生变化时，用来热更新 model

- 注意通常 initState 发生变更时不确保热更新 100%有效，此时会 console 警告
- 通常 actionHandlers 发生变更时热更新有效

**Parameters:**

▪ **moduleName**: _string_

▪ **initState**: _any_

▪ **ActionHandles**: _object_

| Name          | Type |
| ------------- | ---- |
| `constructor` |      |

**Returns:** _void_

---

### reducer

▸ **reducer**(`target`: any, `key`: string, `descriptor`: PropertyDescriptor): _any_

一个类方法的装饰器，用来指示该方法为一个 reducerHandler

- reducerHandler 必须通过 dispatch Action 来触发

**Parameters:**

| Name         | Type               |
| ------------ | ------------------ |
| `target`     | any                |
| `key`        | string             |
| `descriptor` | PropertyDescriptor |

**Returns:** _any_

---

### renderApp

▸ **renderApp**<**V**>(`render`: function, `moduleGetter`: [ModuleGetter](interfaces/modulegetter.md), `appModuleOrName`: string | [CommonModule](interfaces/commonmodule.md), `appViewName`: string, `history`: [HistoryProxy](interfaces/historyproxy.md), `storeOptions`: [StoreOptions](interfaces/storeoptions.md), `beforeRender?`: undefined | function): _Promise‹void›_

该方法用来创建并启动 Client 应用

- 注意该方法只负责加载 Module 和创建 Model，具体的渲染 View 将通过回调执行

**Type parameters:**

▪ **V**

**Parameters:**

▪ **render**: _function_

渲染 View 的回调函数，该回调函数可返回一个 reRender 的方法用来热更新 UI

▸ (`store`: Store‹[StoreState](README.md#storestate)›, `appModel`: [Model](interfaces/model.md), `appView`: V, `ssrInitStoreKey`: string): _function_

**Parameters:**

| Name              | Type                                      |
| ----------------- | ----------------------------------------- |
| `store`           | Store‹[StoreState](README.md#storestate)› |
| `appModel`        | [Model](interfaces/model.md)              |
| `appView`         | V                                         |
| `ssrInitStoreKey` | string                                    |

▸ (`appView`: V): _void_

**Parameters:**

| Name      | Type |
| --------- | ---- |
| `appView` | V    |

▪ **moduleGetter**: _[ModuleGetter](interfaces/modulegetter.md)_

模块的获取方式

▪ **appModuleOrName**: _string | [CommonModule](interfaces/commonmodule.md)_

▪ **appViewName**: _string_

▪ **history**: _[HistoryProxy](interfaces/historyproxy.md)_

抽象的 HistoryProxy 实现

▪`Default value` **storeOptions**: _[StoreOptions](interfaces/storeoptions.md)_= {}

store 的参数，参见 StoreOptions

▪`Optional` **beforeRender**: _undefined | function_

渲染前的钩子，通过该钩子你可以保存或修改 store

**Returns:** _Promise‹void›_

---

### renderSSR

▸ **renderSSR**<**V**>(`render`: function, `moduleGetter`: [ModuleGetter](interfaces/modulegetter.md), `appModuleName`: string, `appViewName`: string, `history`: [HistoryProxy](interfaces/historyproxy.md), `storeOptions`: [StoreOptions](interfaces/storeoptions.md), `beforeRender?`: undefined | function): _Promise‹object›_

SSR 时该方法用来创建并启动 Server 应用

- 注意该方法只负责加载 Module 和创建 Model，具体的渲染 View 将通过回调执行

**Type parameters:**

▪ **V**

**Parameters:**

▪ **render**: _function_

渲染 View 的回调函数

▸ (`store`: Store‹[StoreState](README.md#storestate)›, `appModel`: [Model](interfaces/model.md), `appView`: V, `ssrInitStoreKey`: string): _object_

**Parameters:**

| Name              | Type                                      |
| ----------------- | ----------------------------------------- |
| `store`           | Store‹[StoreState](README.md#storestate)› |
| `appModel`        | [Model](interfaces/model.md)              |
| `appView`         | V                                         |
| `ssrInitStoreKey` | string                                    |

- **data**: _any_

- **html**: _any_

- **ssrInitStoreKey**: _string_

- **store**: _Store_

▪ **moduleGetter**: _[ModuleGetter](interfaces/modulegetter.md)_

模块的获取方式

▪ **appModuleName**: _string_

模块的主入口模块名称

▪ **appViewName**: _string_

▪ **history**: _[HistoryProxy](interfaces/historyproxy.md)_

抽象的 HistoryProxy 实现

▪`Default value` **storeOptions**: _[StoreOptions](interfaces/storeoptions.md)_= {}

store 的参数，参见 StoreOptions

▪`Optional` **beforeRender**: _undefined | function_

渲染前的钩子，通过该钩子你可以保存或修改 store

**Returns:** _Promise‹object›_

---

### routeChangeAction

▸ **routeChangeAction**(`route`: [RouteState](interfaces/routestate.md)): _object_

框架定义的全局路由切换 ActionCreator，拥有固定的 type

**Parameters:**

| Name    | Type                                   | Description |
| ------- | -------------------------------------- | ----------- |
| `route` | [RouteState](interfaces/routestate.md) | 路由数据    |

**Returns:** _object_

- **payload**: _[RouteState](interfaces/routestate.md)‹any›[]_ = [route]

- **type**: _string_ = ActionTypes.RouteChange

---

### routeParamsAction

▸ **routeParamsAction**(`moduleName`: string, `params`: any, `action?`: undefined | string): _object_

当路由发生变化时，通过该 action 触发相关模块的状态发生变化

**Parameters:**

| Name         | Type                    | Description        |
| ------------ | ----------------------- | ------------------ |
| `moduleName` | string                  | 模块名称           |
| `params`     | any                     | 存放在路由上的数据 |
| `action?`    | undefined &#124; string | -                  |

**Returns:** _object_

- **payload**: _any[]_ = [params, action]

- **type**: _string_ = `${moduleName}${config.NSP}${ActionTypes.MRouteParams}`

---

### setConfig

▸ **setConfig**(`_config`: object): _void_

可供设置的全局参数

**Parameters:**

▪ **\_config**: _object_

设置参数

- NSP 默认为. ModuleName\${NSP}ActionName 用于 ActionName 的连接
- VSP 默认为. ModuleName\${VSP}ViewName 用于路由 ViewName 的连接
- MSP 默认为, 用于一个 ActionHandler 同时监听多个 Action 的连接

| Name   | Type                    |
| ------ | ----------------------- |
| `MSP?` | undefined &#124; string |
| `NSP?` | undefined &#124; string |
| `VSP?` | undefined &#124; string |

**Returns:** _void_

---

### setLoading

▸ **setLoading**<**T**>(`item`: T, `moduleName`: string, `groupName`: string): _T_

手动设置 Loading 状态，同一个 key 名的 loading 状态将自动合并

- 参见 LoadingState

**Type parameters:**

▪ **T**: _Promise‹any›_

**Parameters:**

| Name         | Type   | Default                | Description                                   |
| ------------ | ------ | ---------------------- | --------------------------------------------- |
| `item`       | T      | -                      | 一个 Promise 加载项                           |
| `moduleName` | string | MetaData.appModuleName | moduleName+groupName 合起来作为该加载项的 key |
| `groupName`  | string | "global"               | moduleName+groupName 合起来作为该加载项的 key |

**Returns:** _T_

---

### setLoadingDepthTime

▸ **setLoadingDepthTime**(`second`: number): _void_

设置深度加载的时间阀值

**Parameters:**

| Name     | Type   | Description                         |
| -------- | ------ | ----------------------------------- |
| `second` | number | 超过多少秒进入深度加载，默认为 2 秒 |

**Returns:** _void_

---

### viewHotReplacement

▸ **viewHotReplacement**(`moduleName`: string, `views`: object): _void_

当 view 发生变化时，用来热更新 UI

**Parameters:**

| Name         | Type   |
| ------------ | ------ |
| `moduleName` | string |
| `views`      | object |

**Returns:** _void_

## Object literals

### `Const` ActionTypes

### ▪ **ActionTypes**: _object_

框架内置的几个 ActionTypes

### Error

• **Error**: _string_ = `medux${config.NSP}Error`

全局捕获到错误时使用 ActionType：{Error}

### MInit

• **MInit**: _string_ = "Init"

模块初始化时使用 ActionType：{moduleName}.{MInit}

### MLoading

• **MLoading**: _string_ = "Loading"

为模块注入加载状态时使用 ActionType：{moduleName}.{MLoading}

### MRouteParams

• **MRouteParams**: _string_ = "RouteParams"

模块存放在路由中的参数发生变化时使用 ActionType：{moduleName}.{MRouteParams}

### RouteChange

• **RouteChange**: _string_ = `medux${config.NSP}RouteChange`

全局路由发生变化时使用 ActionType：{RouteChange}

---

### `Const` config

### ▪ **config**: _object_

可供设置的全局参数，参见 setConfig

- NSP 默认为. ModuleName\${NSP}ActionName 用于 ActionName 的连接
- VSP 默认为. ModuleName\${VSP}ViewName 用于路由 ViewName 的连接
- MSP 默认为, 用于一个 ActionHandler 同时监听多个 Action 的连接

### MSP

• **MSP**: _string_ = ","

### NSP

• **NSP**: _string_ = "."

### VSP

• **VSP**: _string_ = "."

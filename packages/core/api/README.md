[@medux/core - v1.0.7-alpha.12](README.md)

# @medux/core - v1.0.7-alpha.12

## Index

### Enumerations

* [LoadingState](enums/loadingstate.md)

### Classes

* [BaseModelHandlers](classes/basemodelhandlers.md)

### Interfaces

* [Action](interfaces/action.md)
* [BaseModelState](interfaces/basemodelstate.md)
* [CommonModule](interfaces/commonmodule.md)
* [DisplayViews](interfaces/displayviews.md)
* [HistoryProxy](interfaces/historyproxy.md)
* [Model](interfaces/model.md)
* [Module](interfaces/module.md)
* [ModuleGetter](interfaces/modulegetter.md)
* [RouteData](interfaces/routedata.md)
* [RouteState](interfaces/routestate.md)
* [StoreOptions](interfaces/storeoptions.md)

### Type aliases

* [Actions](README.md#actions)
* [ExportModule](README.md#exportmodule)
* [LoadView](README.md#loadview)
* [RootState](README.md#rootstate)
* [RouteViews](README.md#routeviews)
* [StoreState](README.md#storestate)

### Variables

* [client](README.md#const-client)
* [env](README.md#const-env)
* [isDevelopmentEnv](README.md#const-isdevelopmentenv)
* [isServerEnv](README.md#const-isserverenv)

### Functions

* [cacheModule](README.md#cachemodule)
* [delayPromise](README.md#delaypromise)
* [effect](README.md#effect)
* [errorAction](README.md#erroraction)
* [exportActions](README.md#exportactions)
* [exportModule](README.md#const-exportmodule)
* [getActionData](README.md#getactiondata)
* [getClientStore](README.md#getclientstore)
* [getView](README.md#getview)
* [isPromiseModule](README.md#ispromisemodule)
* [isPromiseView](README.md#ispromiseview)
* [isServer](README.md#isserver)
* [loadModel](README.md#loadmodel)
* [logger](README.md#logger)
* [modelHotReplacement](README.md#modelhotreplacement)
* [reducer](README.md#reducer)
* [renderApp](README.md#renderapp)
* [renderSSR](README.md#renderssr)
* [routeChangeAction](README.md#routechangeaction)
* [routeParamsAction](README.md#routeparamsaction)
* [setConfig](README.md#setconfig)
* [setLoading](README.md#setloading)
* [setLoadingDepthTime](README.md#setloadingdepthtime)
* [viewHotReplacement](README.md#viewhotreplacement)

### Object literals

* [ActionTypes](README.md#const-actiontypes)
* [config](README.md#const-config)

## Type aliases

###  Actions

Ƭ **Actions**: *object*

将ModelHandlers变成Action Creator
- 该数据结构由ExportModule自动生成
- medux中的action通常都由此Creator自动生成

#### Type declaration:

___

###  ExportModule

Ƭ **ExportModule**: *function*

导出Module

**`param`** 模块名，不能重复

**`param`** 模块初始状态

**`param`** 模块的ModelHandlers类，必须继承BaseModelHandlers

**`param`** 模块需要导出给外部使用的View，若无需给外部使用可不导出

**`returns`** medux定义的module标准数据结构

#### Type declaration:

▸ <**S**, **V**, **T**, **N**>(`moduleName`: N, `initState`: S, `ActionHandles`: object, `views`: V): *Module<Model&lt;S&gt;, V, Actions&lt;T&gt;, N>["default"]*

**Type parameters:**

▪ **S**: *[BaseModelState](interfaces/basemodelstate.md)*

▪ **V**: *object*

▪ **T**: *[BaseModelHandlers](classes/basemodelhandlers.md)‹S, any›*

▪ **N**: *string*

**Parameters:**

▪ **moduleName**: *N*

▪ **initState**: *S*

▪ **ActionHandles**: *object*

Name | Type |
------ | ------ |
`constructor` |  |

▪ **views**: *V*

___

###  LoadView

Ƭ **LoadView**: *function*

动态加载View，因为每种UI框架动态加载View的方式不一样，所有此处只是提供一个抽象接口

**`see`** getView

#### Type declaration:

▸ <**M**, **V**, **N**>(`moduleName`: M, `viewName`: N, `options?`: Options, `loading?`: Comp, `error?`: Comp): *V[N]*

**Type parameters:**

▪ **M**: *Extract‹keyof MG, string›*

▪ **V**: *ModuleViews‹ReturnModule‹MG[M]››*

▪ **N**: *Extract‹keyof V, string›*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | M |
`viewName` | N |
`options?` | Options |
`loading?` | Comp |
`error?` | Comp |

___

###  RootState

Ƭ **RootState**: *object & object*

整个Store的数据结构模型，主要分为三部分
- route，路由数据
- modules，各个模块的数据，可通过isModule辨别
- otherReducers，其他第三方reducers生成的数据

___

###  RouteViews

Ƭ **RouteViews**: *object*

描述当前路由下展示了哪些views

#### Type declaration:

___

###  StoreState

Ƭ **StoreState**: *object & object*

medux使用的Store数据模型结构

## Variables

### `Const` client

• **client**: *ENV | undefined* = isServerEnv ? undefined : env

___

### `Const` env

• **env**: *ENV* = (typeof window === 'object' && window.window) || (typeof global === 'object' && global.global) || global

___

### `Const` isDevelopmentEnv

• **isDevelopmentEnv**: *boolean* = process.env.NODE_ENV !== 'production'

___

### `Const` isServerEnv

• **isServerEnv**: *boolean* = typeof window === 'undefined' && typeof global === 'object' && global.global === global

## Functions

###  cacheModule

▸ **cacheModule**<**T**>(`module`: T): *function*

**Type parameters:**

▪ **T**: *[CommonModule](interfaces/commonmodule.md)*

**Parameters:**

Name | Type |
------ | ------ |
`module` | T |

**Returns:** *function*

▸ (): *T*

___

###  delayPromise

▸ **delayPromise**(`second`: number): *(Anonymous function)*

一个类方法的装饰器，将其延迟执行
- 可用来装饰effectHandler
- 也可以装饰其他类

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`second` | number | 延迟秒数  |

**Returns:** *(Anonymous function)*

___

###  effect

▸ **effect**(`loadingForGroupName?`: string | null, `loadingForModuleName?`: undefined | string): *(Anonymous function)*

一个类方法的装饰器，用来指示该方法为一个effectHandler
- effectHandler必须通过dispatch Action来触发

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`loadingForGroupName?` | string &#124; null | 注入加载状态的分组key，默认为global，如果为null表示不注入加载状态 |
`loadingForModuleName?` | undefined &#124; string | 可将loading状态合并注入到其他module，默认为入口主模块  ``` effect(null) 不注入加载状态 effect() == effect('global','app') effect('global') = effect('global',thisModuleName) ```  |

**Returns:** *(Anonymous function)*

___

###  errorAction

▸ **errorAction**(`error`: any): *object*

框架定义的全局错误ActionCreator，拥有固定的type

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`error` | any | 错误  |

**Returns:** *object*

* **payload**: *any[]* = [error]

* **type**: *string* = ActionTypes.Error

___

###  exportActions

▸ **exportActions**<**G**>(`moduleGetter`: G): *object*

为所有模块的modelHanders自动生成ActionCreator
- 注意如果环境不支持ES7 Proxy，将无法dispatch一个未经初始化的ModelAction，此时必须手动提前loadModel
- 参见 loadModel

**Type parameters:**

▪ **G**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`moduleGetter` | G | 模块的获取方式  |

**Returns:** *object*

___

### `Const` exportModule

▸ **exportModule**(`moduleName`: N, `initState`: S, `ActionHandles`: object, `views`: V): *object*

导出Module，该方法为ExportModule接口的实现

**Parameters:**

▪ **moduleName**: *N*

模块名，不能重复

▪ **initState**: *S*

模块初始状态

▪ **ActionHandles**: *object*

模块的ModelHandlers类，必须继承BaseModelHandlers

Name | Type |
------ | ------ |
`constructor` |  |

▪ **views**: *V*

模块需要导出给外部使用的View，若无需给外部使用可不导出

**Returns:** *object*

medux定义的module标准数据结构

* **actions**: *any*

* **model**: *model*

* **moduleName**: *N*

* **views**: *V*

___

###  getActionData

▸ **getActionData**(`action`: [Action](interfaces/action.md)): *any[]*

从redux action上获取有效数据载体

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`action` | [Action](interfaces/action.md) | redux的action  |

**Returns:** *any[]*

___

###  getClientStore

▸ **getClientStore**(): *ModelStore*

在client中运行时，全局只有一个单例的Store对象，可通过该方法直接获得

**Returns:** *ModelStore*

___

###  getView

▸ **getView**<**T**>(`moduleName`: string, `viewName`: string, `modelOptions?`: any): *T | Promise‹T›*

动态获取View，与LoadView的区别是：
- getView仅获取view，并不渲染，与UI平台无关
- LoadView内部会调用getView之后会渲染View
- getView会自动加载并初始化该view对应的model

**Type parameters:**

▪ **T**

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | string |
`viewName` | string |
`modelOptions?` | any |

**Returns:** *T | Promise‹T›*

___

###  isPromiseModule

▸ **isPromiseModule**(`module`: [Module](interfaces/module.md) | Promise‹[Module](interfaces/module.md)›): *module is Promise&lt;Module&gt;*

通过moduleGetter获得的module可能是同步的也可能是异步的，此方法用来判断

**Parameters:**

Name | Type |
------ | ------ |
`module` | [Module](interfaces/module.md) &#124; Promise‹[Module](interfaces/module.md)› |

**Returns:** *module is Promise&lt;Module&gt;*

___

###  isPromiseView

▸ **isPromiseView**<**T**>(`moduleView`: T | Promise‹T›): *moduleView is Promise&lt;T&gt;*

通过getView获得的view可能是同步的也可能是异步的，此方法用来判断

**Type parameters:**

▪ **T**

**Parameters:**

Name | Type |
------ | ------ |
`moduleView` | T &#124; Promise‹T› |

**Returns:** *moduleView is Promise&lt;T&gt;*

___

###  isServer

▸ **isServer**(): *boolean*

**Returns:** *boolean*

___

###  loadModel

▸ **loadModel**<**MG**>(`moduleName`: Extract‹keyof MG, string›, `storeInstance?`: ModelStore, `options?`: any): *void | Promise‹void›*

动态加载并初始化其他模块的model

**Type parameters:**

▪ **MG**: *[ModuleGetter](interfaces/modulegetter.md)*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`moduleName` | Extract‹keyof MG, string› | 要加载的模块名 |
`storeInstance?` | ModelStore | - |
`options?` | any | model初始化时可以传入的数据，参见Model接口  |

**Returns:** *void | Promise‹void›*

___

###  logger

▸ **logger**(`before`: function, `after`: null | function): *(Anonymous function)*

一个类方法的装饰器，用来向reducerHandler或effectHandler中注入before和after的钩子
- 注意不管该handler是否执行成功，前后钩子都会强制执行

**Parameters:**

▪ **before**: *function*

actionHandler执行前的钩子

▸ (`action`: [Action](interfaces/action.md), `moduleName`: string, `promiseResult`: Promise‹any›): *void*

**Parameters:**

Name | Type |
------ | ------ |
`action` | [Action](interfaces/action.md) |
`moduleName` | string |
`promiseResult` | Promise‹any› |

▪ **after**: *null | function*

actionHandler执行后的钩子

**Returns:** *(Anonymous function)*

___

###  modelHotReplacement

▸ **modelHotReplacement**(`moduleName`: string, `initState`: any, `ActionHandles`: object): *void*

当model发生变化时，用来热更新model
- 注意通常initState发生变更时不确保热更新100%有效，此时会console警告
- 通常actionHandlers发生变更时热更新有效

**Parameters:**

▪ **moduleName**: *string*

▪ **initState**: *any*

▪ **ActionHandles**: *object*

Name | Type |
------ | ------ |
`constructor` |  |

**Returns:** *void*

___

###  reducer

▸ **reducer**(`target`: any, `key`: string, `descriptor`: PropertyDescriptor): *any*

一个类方法的装饰器，用来指示该方法为一个reducerHandler
- reducerHandler必须通过dispatch Action来触发

**Parameters:**

Name | Type |
------ | ------ |
`target` | any |
`key` | string |
`descriptor` | PropertyDescriptor |

**Returns:** *any*

___

###  renderApp

▸ **renderApp**<**V**>(`render`: function, `moduleGetter`: [ModuleGetter](interfaces/modulegetter.md), `appModuleOrName`: string | [CommonModule](interfaces/commonmodule.md), `history`: [HistoryProxy](interfaces/historyproxy.md), `storeOptions`: [StoreOptions](interfaces/storeoptions.md), `beforeRender?`: undefined | function): *Promise‹void›*

该方法用来创建并启动Client应用
- 注意该方法只负责加载Module和创建Model，具体的渲染View将通过回调执行

**Type parameters:**

▪ **V**

**Parameters:**

▪ **render**: *function*

渲染View的回调函数，该回调函数可返回一个reRender的方法用来热更新UI

▸ (`store`: Store‹[StoreState](README.md#storestate)›, `appModel`: [Model](interfaces/model.md), `appView`: V, `ssrInitStoreKey`: string): *function*

**Parameters:**

Name | Type |
------ | ------ |
`store` | Store‹[StoreState](README.md#storestate)› |
`appModel` | [Model](interfaces/model.md) |
`appView` | V |
`ssrInitStoreKey` | string |

▸ (`appView`: V): *void*

**Parameters:**

Name | Type |
------ | ------ |
`appView` | V |

▪ **moduleGetter**: *[ModuleGetter](interfaces/modulegetter.md)*

模块的获取方式

▪ **appModuleOrName**: *string | [CommonModule](interfaces/commonmodule.md)*

▪ **history**: *[HistoryProxy](interfaces/historyproxy.md)*

抽象的HistoryProxy实现

▪`Default value`  **storeOptions**: *[StoreOptions](interfaces/storeoptions.md)*= {}

store的参数，参见StoreOptions

▪`Optional`  **beforeRender**: *undefined | function*

渲染前的钩子，通过该钩子你可以保存或修改store

**Returns:** *Promise‹void›*

___

###  renderSSR

▸ **renderSSR**<**V**>(`render`: function, `moduleGetter`: [ModuleGetter](interfaces/modulegetter.md), `appModuleName`: string, `history`: [HistoryProxy](interfaces/historyproxy.md), `storeOptions`: [StoreOptions](interfaces/storeoptions.md), `beforeRender?`: undefined | function): *Promise‹object›*

SSR时该方法用来创建并启动Server应用
- 注意该方法只负责加载Module和创建Model，具体的渲染View将通过回调执行

**Type parameters:**

▪ **V**

**Parameters:**

▪ **render**: *function*

渲染View的回调函数

▸ (`store`: Store‹[StoreState](README.md#storestate)›, `appModel`: [Model](interfaces/model.md), `appView`: V, `ssrInitStoreKey`: string): *object*

**Parameters:**

Name | Type |
------ | ------ |
`store` | Store‹[StoreState](README.md#storestate)› |
`appModel` | [Model](interfaces/model.md) |
`appView` | V |
`ssrInitStoreKey` | string |

* **data**: *any*

* **html**: *any*

* **ssrInitStoreKey**: *string*

* **store**: *Store*

▪ **moduleGetter**: *[ModuleGetter](interfaces/modulegetter.md)*

模块的获取方式

▪ **appModuleName**: *string*

模块的主入口模块名称

▪ **history**: *[HistoryProxy](interfaces/historyproxy.md)*

抽象的HistoryProxy实现

▪`Default value`  **storeOptions**: *[StoreOptions](interfaces/storeoptions.md)*= {}

store的参数，参见StoreOptions

▪`Optional`  **beforeRender**: *undefined | function*

渲染前的钩子，通过该钩子你可以保存或修改store

**Returns:** *Promise‹object›*

___

###  routeChangeAction

▸ **routeChangeAction**(`route`: [RouteState](interfaces/routestate.md)): *object*

框架定义的全局路由切换ActionCreator，拥有固定的type

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`route` | [RouteState](interfaces/routestate.md) | 路由数据  |

**Returns:** *object*

* **payload**: *[RouteState](interfaces/routestate.md)‹any›[]* = [route]

* **type**: *string* = ActionTypes.RouteChange

___

###  routeParamsAction

▸ **routeParamsAction**(`moduleName`: string, `params`: any, `action?`: undefined | string): *object*

当路由发生变化时，通过该action触发相关模块的状态发生变化

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`moduleName` | string | 模块名称 |
`params` | any | 存放在路由上的数据  |
`action?` | undefined &#124; string | - |

**Returns:** *object*

* **payload**: *any[]* = [params, action]

* **type**: *string* = `${moduleName}${config.NSP}${ActionTypes.MRouteParams}`

___

###  setConfig

▸ **setConfig**(`_config`: object): *void*

可供设置的全局参数

**Parameters:**

▪ **_config**: *object*

设置参数
- NSP 默认为. ModuleName${NSP}ActionName 用于ActionName的连接
- VSP 默认为. ModuleName${VSP}ViewName 用于路由ViewName的连接
- MSP 默认为, 用于一个ActionHandler同时监听多个Action的连接

Name | Type |
------ | ------ |
`MSP?` | undefined &#124; string |
`NSP?` | undefined &#124; string |
`VSP?` | undefined &#124; string |

**Returns:** *void*

___

###  setLoading

▸ **setLoading**<**T**>(`item`: T, `moduleName`: string, `groupName`: string): *T*

手动设置Loading状态，同一个key名的loading状态将自动合并
- 参见LoadingState

**Type parameters:**

▪ **T**: *Promise‹any›*

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`item` | T | - | 一个Promise加载项 |
`moduleName` | string | MetaData.appModuleName | moduleName+groupName合起来作为该加载项的key |
`groupName` | string | "global" | moduleName+groupName合起来作为该加载项的key  |

**Returns:** *T*

___

###  setLoadingDepthTime

▸ **setLoadingDepthTime**(`second`: number): *void*

设置深度加载的时间阀值

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`second` | number | 超过多少秒进入深度加载，默认为2秒  |

**Returns:** *void*

___

###  viewHotReplacement

▸ **viewHotReplacement**(`moduleName`: string, `views`: object): *void*

当view发生变化时，用来热更新UI

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | string |
`views` | object |

**Returns:** *void*

## Object literals

### `Const` ActionTypes

### ▪ **ActionTypes**: *object*

框架内置的几个ActionTypes

###  Error

• **Error**: *string* = `medux${config.NSP}Error`

全局捕获到错误时使用ActionType：{Error}

###  MInit

• **MInit**: *string* = "Init"

模块初始化时使用ActionType：{moduleName}.{MInit}

###  MLoading

• **MLoading**: *string* = "Loading"

为模块注入加载状态时使用ActionType：{moduleName}.{MLoading}

###  MRouteParams

• **MRouteParams**: *string* = "RouteParams"

模块存放在路由中的参数发生变化时使用ActionType：{moduleName}.{MRouteParams}

###  RouteChange

• **RouteChange**: *string* = `medux${config.NSP}RouteChange`

全局路由发生变化时使用ActionType：{RouteChange}

___

### `Const` config

### ▪ **config**: *object*

可供设置的全局参数，参见setConfig
- NSP 默认为. ModuleName${NSP}ActionName 用于ActionName的连接
- VSP 默认为. ModuleName${VSP}ViewName 用于路由ViewName的连接
- MSP 默认为, 用于一个ActionHandler同时监听多个Action的连接

###  MSP

• **MSP**: *string* = ","

###  NSP

• **NSP**: *string* = "."

###  VSP

• **VSP**: *string* = "."

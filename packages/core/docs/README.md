[@medux/core - v0.2.37](README.md)

# @medux/core - v0.2.37

## Index

### Enumerations

* [LoadingState](enums/loadingstate.md)

### Classes

* [BaseModelHandlers](classes/basemodelhandlers.md)

### Interfaces

* [Action](interfaces/action.md)
* [BaseModelState](interfaces/basemodelstate.md)
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

### Functions

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

#### Type declaration:

___

###  ExportModule

Ƭ **ExportModule**: *function*

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

___

###  RouteViews

Ƭ **RouteViews**: *object*

#### Type declaration:

___

###  StoreState

Ƭ **StoreState**: *object & object*

## Functions

###  delayPromise

▸ **delayPromise**(`second`: number): *(Anonymous function)*

**Parameters:**

Name | Type |
------ | ------ |
`second` | number |

**Returns:** *(Anonymous function)*

___

###  effect

▸ **effect**(`loadingForGroupName?`: string | null, `loadingForModuleName?`: undefined | string): *(Anonymous function)*

**Parameters:**

Name | Type |
------ | ------ |
`loadingForGroupName?` | string &#124; null |
`loadingForModuleName?` | undefined &#124; string |

**Returns:** *(Anonymous function)*

___

###  errorAction

▸ **errorAction**(`error`: any): *object*

**Parameters:**

Name | Type |
------ | ------ |
`error` | any |

**Returns:** *object*

* **payload**: *any[]* = [error]

* **type**: *string* = ActionTypes.Error

___

###  exportActions

▸ **exportActions**<**G**>(`moduleGetter`: G): *object*

**Type parameters:**

▪ **G**: *object*

**Parameters:**

Name | Type |
------ | ------ |
`moduleGetter` | G |

**Returns:** *object*

___

### `Const` exportModule

▸ **exportModule**(`moduleName`: N, `initState`: S, `ActionHandles`: object, `views`: V): *object*

**Parameters:**

▪ **moduleName**: *N*

▪ **initState**: *S*

▪ **ActionHandles**: *object*

Name | Type |
------ | ------ |
`constructor` |  |

▪ **views**: *V*

**Returns:** *object*

* **actions**: *any*

* **model**: *model*

* **moduleName**: *N*

* **views**: *V*

___

###  getActionData

▸ **getActionData**(`action`: [Action](interfaces/action.md)): *any[]*

**Parameters:**

Name | Type |
------ | ------ |
`action` | [Action](interfaces/action.md) |

**Returns:** *any[]*

___

###  getClientStore

▸ **getClientStore**(): *ModelStore*

**Returns:** *ModelStore*

___

###  getView

▸ **getView**<**T**>(`moduleName`: string, `viewName`: string, `modelOptions?`: any): *T | Promise‹T›*

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

**Parameters:**

Name | Type |
------ | ------ |
`module` | [Module](interfaces/module.md) &#124; Promise‹[Module](interfaces/module.md)› |

**Returns:** *module is Promise&lt;Module&gt;*

___

###  isPromiseView

▸ **isPromiseView**<**T**>(`moduleView`: T | Promise‹T›): *moduleView is Promise&lt;T&gt;*

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

▸ **loadModel**<**MG**>(`moduleName`: Extract‹keyof MG, string›, `store`: ModelStore, `options?`: any): *void | Promise‹void›*

**Type parameters:**

▪ **MG**: *[ModuleGetter](interfaces/modulegetter.md)*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | Extract‹keyof MG, string› |
`store` | ModelStore |
`options?` | any |

**Returns:** *void | Promise‹void›*

___

###  logger

▸ **logger**(`before`: function, `after`: null | function): *(Anonymous function)*

**Parameters:**

▪ **before**: *function*

▸ (`action`: [Action](interfaces/action.md), `moduleName`: string, `promiseResult`: Promise‹any›): *void*

**Parameters:**

Name | Type |
------ | ------ |
`action` | [Action](interfaces/action.md) |
`moduleName` | string |
`promiseResult` | Promise‹any› |

▪ **after**: *null | function*

**Returns:** *(Anonymous function)*

___

###  modelHotReplacement

▸ **modelHotReplacement**(`moduleName`: string, `initState`: any, `ActionHandles`: object): *void*

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

**Parameters:**

Name | Type |
------ | ------ |
`target` | any |
`key` | string |
`descriptor` | PropertyDescriptor |

**Returns:** *any*

___

###  renderApp

▸ **renderApp**<**V**>(`render`: function, `moduleGetter`: [ModuleGetter](interfaces/modulegetter.md), `appModuleName`: string, `history`: [HistoryProxy](interfaces/historyproxy.md), `storeOptions`: [StoreOptions](interfaces/storeoptions.md), `beforeRender?`: undefined | function): *Promise‹void›*

**Type parameters:**

▪ **V**

**Parameters:**

▪ **render**: *function*

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

▪ **appModuleName**: *string*

▪ **history**: *[HistoryProxy](interfaces/historyproxy.md)*

▪`Default value`  **storeOptions**: *[StoreOptions](interfaces/storeoptions.md)*= {}

▪`Optional`  **beforeRender**: *undefined | function*

**Returns:** *Promise‹void›*

___

###  renderSSR

▸ **renderSSR**<**V**>(`render`: function, `moduleGetter`: [ModuleGetter](interfaces/modulegetter.md), `appModuleName`: string, `history`: [HistoryProxy](interfaces/historyproxy.md), `storeOptions`: [StoreOptions](interfaces/storeoptions.md), `beforeRender?`: undefined | function): *Promise‹object›*

**Type parameters:**

▪ **V**

**Parameters:**

▪ **render**: *function*

▸ (`store`: Store‹[StoreState](README.md#storestate)›, `appModel`: [Model](interfaces/model.md), `appViews`: V, `ssrInitStoreKey`: string): *object*

**Parameters:**

Name | Type |
------ | ------ |
`store` | Store‹[StoreState](README.md#storestate)› |
`appModel` | [Model](interfaces/model.md) |
`appViews` | V |
`ssrInitStoreKey` | string |

* **data**: *any*

* **html**: *any*

* **ssrInitStoreKey**: *string*

* **store**: *Store*

▪ **moduleGetter**: *[ModuleGetter](interfaces/modulegetter.md)*

▪ **appModuleName**: *string*

▪ **history**: *[HistoryProxy](interfaces/historyproxy.md)*

▪`Default value`  **storeOptions**: *[StoreOptions](interfaces/storeoptions.md)*= {}

▪`Optional`  **beforeRender**: *undefined | function*

**Returns:** *Promise‹object›*

___

###  routeChangeAction

▸ **routeChangeAction**(`route`: [RouteState](interfaces/routestate.md)): *object*

**Parameters:**

Name | Type |
------ | ------ |
`route` | [RouteState](interfaces/routestate.md) |

**Returns:** *object*

* **payload**: *[RouteState](interfaces/routestate.md)‹any›[]* = [route]

* **type**: *string* = ActionTypes.RouteChange

___

###  routeParamsAction

▸ **routeParamsAction**(`moduleName`: string, `params`: any): *object*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | string |
`params` | any |

**Returns:** *object*

* **payload**: *any[]* = [params]

* **type**: *string* = `${moduleName}${config.NSP}${ActionTypes.MRouteParams}`

___

###  setConfig

▸ **setConfig**(`_config`: object): *void*

**Parameters:**

▪ **_config**: *object*

Name | Type |
------ | ------ |
`MSP?` | undefined &#124; string |
`NSP?` | undefined &#124; string |
`VSP?` | undefined &#124; string |

**Returns:** *void*

___

###  setLoading

▸ **setLoading**<**T**>(`item`: T, `moduleName`: string, `group`: string): *T*

**Type parameters:**

▪ **T**: *Promise‹any›*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`item` | T | - |
`moduleName` | string | MetaData.appModuleName |
`group` | string | "global" |

**Returns:** *T*

___

###  setLoadingDepthTime

▸ **setLoadingDepthTime**(`second`: number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`second` | number |

**Returns:** *void*

___

###  viewHotReplacement

▸ **viewHotReplacement**(`moduleName`: string, `views`: object): *void*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | string |
`views` | object |

**Returns:** *void*

## Object literals

### `Const` ActionTypes

### ▪ **ActionTypes**: *object*

###  Error

• **Error**: *string* = `medux${config.NSP}Error`

###  MInit

• **MInit**: *string* = "Init"

###  MLoading

• **MLoading**: *string* = "Loading"

###  MRouteParams

• **MRouteParams**: *string* = "RouteParams"

###  RouteChange

• **RouteChange**: *string* = `medux${config.NSP}RouteChange`

___

### `Const` config

### ▪ **config**: *object*

###  MSP

• **MSP**: *string* = ","

###  NSP

• **NSP**: *string* = "."

###  VSP

• **VSP**: *string* = "."

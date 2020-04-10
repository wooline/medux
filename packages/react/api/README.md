[@medux/react - v0.2.38](README.md)

# @medux/react - v0.2.38

## Index

### Type aliases

* [LoadView](README.md#loadview)

### Variables

* [exportModule](README.md#const-exportmodule)

### Functions

* [loadView](README.md#const-loadview)
* [renderApp](README.md#renderapp)
* [renderSSR](README.md#renderssr)

## Type aliases

###  LoadView

Ƭ **LoadView**: *LoadView‹T, object, ComponentType‹any››*

## Variables

### `Const` exportModule

• **exportModule**: *ExportModule‹ComponentType‹any››* = core.exportModule

## Functions

### `Const` loadView

▸ **loadView**(`moduleName`: M, `viewName`: N, `options`: undefined | object, `Loading`: undefined | ComponentClass‹any, any› | FunctionComponent‹any›, `Error`: undefined | ComponentClass‹any, any› | FunctionComponent‹any›): *any*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | M |
`viewName` | N |
`options` | undefined &#124; object |
`Loading` | undefined &#124; ComponentClass‹any, any› &#124; FunctionComponent‹any› |
`Error` | undefined &#124; ComponentClass‹any, any› &#124; FunctionComponent‹any› |

**Returns:** *any*

___

###  renderApp

▸ **renderApp**(`moduleGetter`: ModuleGetter, `appModuleName`: string, `historyProxy`: HistoryProxy, `storeOptions`: StoreOptions, `container`: string | Element | function, `beforeRender?`: undefined | function): *Promise‹void›*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`moduleGetter` | ModuleGetter | - |
`appModuleName` | string | - |
`historyProxy` | HistoryProxy | - |
`storeOptions` | StoreOptions | - |
`container` | string &#124; Element &#124; function | "root" |
`beforeRender?` | undefined &#124; function | - |

**Returns:** *Promise‹void›*

___

###  renderSSR

▸ **renderSSR**(`moduleGetter`: ModuleGetter, `appModuleName`: string, `historyProxy`: HistoryProxy, `storeOptions`: StoreOptions, `renderToStream`: boolean, `beforeRender?`: undefined | function): *Promise‹object›*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`moduleGetter` | ModuleGetter | - |
`appModuleName` | string | - |
`historyProxy` | HistoryProxy | - |
`storeOptions` | StoreOptions | {} |
`renderToStream` | boolean | false |
`beforeRender?` | undefined &#124; function | - |

**Returns:** *Promise‹object›*

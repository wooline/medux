[@medux/core - v1.0.7-alpha.14](../README.md) › [StoreOptions](storeoptions.md)

# Interface: StoreOptions

创建Store时的选项，通过renderApp或renderSSR传入

## Hierarchy

* **StoreOptions**

## Index

### Properties

* [enhancers](storeoptions.md#optional-enhancers)
* [initData](storeoptions.md#optional-initdata)
* [middlewares](storeoptions.md#optional-middlewares)
* [reducers](storeoptions.md#optional-reducers)
* [ssrInitStoreKey](storeoptions.md#optional-ssrinitstorekey)

## Properties

### `Optional` enhancers

• **enhancers**? : *StoreEnhancer[]*

redux增强器

___

### `Optional` initData

• **initData**? : *undefined | object*

store的初始数据

___

### `Optional` middlewares

• **middlewares**? : *Middleware[]*

redux中间件

___

### `Optional` reducers

• **reducers**? : *ReducersMapObject*

如果你需要独立的第三方reducers可以通过此注入
- store根节点下reducers数据和module数据，可通过isModule来区分

___

### `Optional` ssrInitStoreKey

• **ssrInitStoreKey**? : *undefined | string*

ssr时使用的全局key，用来保存server输出的初始Data
- 默认为'meduxInitStore'

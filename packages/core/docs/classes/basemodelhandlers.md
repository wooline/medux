[@medux/core - v0.2.37](../README.md) › [BaseModelHandlers](basemodelhandlers.md)

# Class: BaseModelHandlers <**S, R**>

ModelHandlers基类.
所有ModelHandlers必须继承此基类.

## Type parameters

▪ **S**: *[BaseModelState](../interfaces/basemodelstate.md)*

▪ **R**: *object*

## Hierarchy

* **BaseModelHandlers**

## Index

### Constructors

* [constructor](basemodelhandlers.md#constructor)

### Properties

* [actions](basemodelhandlers.md#protected-actions)
* [moduleName](basemodelhandlers.md#protected-modulename)
* [store](basemodelhandlers.md#protected-store)

### Accessors

* [currentRootState](basemodelhandlers.md#protected-currentrootstate)
* [currentState](basemodelhandlers.md#protected-currentstate)
* [prevRootState](basemodelhandlers.md#protected-prevrootstate)
* [prevState](basemodelhandlers.md#protected-prevstate)
* [rootState](basemodelhandlers.md#protected-rootstate)
* [state](basemodelhandlers.md#protected-state)

### Methods

* [Init](basemodelhandlers.md#protected-init)
* [Loading](basemodelhandlers.md#protected-loading)
* [RouteParams](basemodelhandlers.md#routeparams)
* [Update](basemodelhandlers.md#protected-update)
* [callThisAction](basemodelhandlers.md#protected-callthisaction)
* [dispatch](basemodelhandlers.md#protected-dispatch)
* [getCurrentRootState](basemodelhandlers.md#protected-getcurrentrootstate)
* [getCurrentState](basemodelhandlers.md#protected-getcurrentstate)
* [getPrevRootState](basemodelhandlers.md#protected-getprevrootstate)
* [getPrevState](basemodelhandlers.md#protected-getprevstate)
* [getRootState](basemodelhandlers.md#protected-getrootstate)
* [getState](basemodelhandlers.md#protected-getstate)
* [loadModel](basemodelhandlers.md#protected-loadmodel)
* [updateState](basemodelhandlers.md#protected-updatestate)

## Constructors

###  constructor

\+ **new BaseModelHandlers**(`moduleName`: string, `store`: ModelStore): *[BaseModelHandlers](basemodelhandlers.md)*

构造函数的参数将由框架自动传入

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`moduleName` | string | 模块名称，不能重复 |
`store` | ModelStore | 全局单例Store的引用  |

**Returns:** *[BaseModelHandlers](basemodelhandlers.md)*

## Properties

### `Protected` actions

• **actions**: *[Actions](../README.md#actions)‹this›*

引用本module的actions
this.actions相当于actions[this.moduleName]

___

### `Protected` moduleName

• **moduleName**: *string*

模块名称，不能重复

___

### `Protected` store

• **store**: *ModelStore*

全局单例Store的引用

## Accessors

### `Protected` currentRootState

• **get currentRootState**(): *R*

获取整个store的及时state
currentState与state的区别是当一个action引起多个reducer执行时：
state会等到所有reducer执行完成时才变化，
currentState反应的是实时状态，

**Returns:** *R*

___

### `Protected` currentState

• **get currentState**(): *S*

获取本Model的及时state

currentState与state的区别是当一个action引起多个reducer执行时：

state会等到所有reducer执行完成时才变化，

currentState反应的是实时状态，

**Returns:** *S*

___

### `Protected` prevRootState

• **get prevRootState**(): *R*

获取整个store的上一个state状态

**Returns:** *R*

___

### `Protected` prevState

• **get prevState**(): *undefined | S*

获取本Model的上一个state状态

**Returns:** *undefined | S*

___

### `Protected` rootState

• **get rootState**(): *R*

获取整个store的state

**Returns:** *R*

___

### `Protected` state

• **get state**(): *S*

获取本Model的state

**Returns:** *S*

## Methods

### `Protected` Init

▸ **Init**(`initState`: S, `routeParams?`: any, `options?`: any): *S*

**Parameters:**

Name | Type |
------ | ------ |
`initState` | S |
`routeParams?` | any |
`options?` | any |

**Returns:** *S*

___

### `Protected` Loading

▸ **Loading**(`payload`: object): *S*

**Parameters:**

Name | Type |
------ | ------ |
`payload` | object |

**Returns:** *S*

___

###  RouteParams

▸ **RouteParams**(`payload`: object): *S*

**Parameters:**

Name | Type |
------ | ------ |
`payload` | object |

**Returns:** *S*

___

### `Protected` Update

▸ **Update**(`payload`: S): *S*

**Parameters:**

Name | Type |
------ | ------ |
`payload` | S |

**Returns:** *S*

___

### `Protected` callThisAction

▸ **callThisAction**<**T**>(`handler`: function, ...`rest`: T): *object*

**Type parameters:**

▪ **T**: *any[]*

**Parameters:**

▪ **handler**: *function*

▸ (...`args`: T): *any*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | T |

▪... **rest**: *T*

**Returns:** *object*

* **payload**? : *any[]*

* **type**: *string*

___

### `Protected` dispatch

▸ **dispatch**(`action`: [Action](../interfaces/action.md)): *[Action](../interfaces/action.md) | Promise‹void›*

**Parameters:**

Name | Type |
------ | ------ |
`action` | [Action](../interfaces/action.md) |

**Returns:** *[Action](../interfaces/action.md) | Promise‹void›*

___

### `Protected` getCurrentRootState

▸ **getCurrentRootState**(): *R*

ie8不支持getter专用

**Returns:** *R*

___

### `Protected` getCurrentState

▸ **getCurrentState**(): *S*

ie8不支持getter专用

**Returns:** *S*

___

### `Protected` getPrevRootState

▸ **getPrevRootState**(): *R*

获取整个store的上一个state状态
ie8不支持getter专用

**Returns:** *R*

___

### `Protected` getPrevState

▸ **getPrevState**(): *undefined | S*

获取本Model的上一个state状态
ie8不支持getter专用

**Returns:** *undefined | S*

___

### `Protected` getRootState

▸ **getRootState**(): *R*

- 获取整个store的state
- ie8不支持getter专用

**Returns:** *R*

___

### `Protected` getState

▸ **getState**(): *S*

获取本Model的state
ie8不支持getter专用

**Returns:** *S*

___

### `Protected` loadModel

▸ **loadModel**(`moduleName`: Extract‹keyof R, string›, `options?`: any): *void | Promise‹void›*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | Extract‹keyof R, string› |
`options?` | any |

**Returns:** *void | Promise‹void›*

___

### `Protected` updateState

▸ **updateState**(`payload`: Partial‹S›): *void*

**Parameters:**

Name | Type |
------ | ------ |
`payload` | Partial‹S› |

**Returns:** *void*

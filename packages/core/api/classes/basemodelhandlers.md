[@medux/core - v1.0.7-alpha.14](../README.md) › [BaseModelHandlers](basemodelhandlers.md)

# Class: BaseModelHandlers <**S, R**>

ModelHandlers基类
所有ModelHandlers必须继承此基类

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

- 引用本module的actions
- this.actions相当于actions[this.moduleName]

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

获取整个store的实时state，通常在reducer中使用，当一个action引起多个不同模块reducer执行时：
- state会等到所有模块的reducer更新完成时才变化
- currentState是实时更新变化

**Returns:** *R*

___

### `Protected` currentState

• **get currentState**(): *S*

- 获取本Model的实时state，通常在reducer中使用，当一个action引起多个不同模块reducer执行时：
- state会等到所有模块的reducer更新完成时才变化
- currentState是实时更新变化

**Returns:** *S*

___

### `Protected` prevRootState

• **get prevRootState**(): *R*

获整个store的前state状态，通常在effect中使用，
当一个action同时引起reducer和effect执行时：
- 所有reducer会先执行完毕并更新rootState
- 之后才开始执行effect，此时effect中取到的rootState已经被reducer变更了
- 使用prevState可以取到reducer变更之前的state

**Returns:** *R*

___

### `Protected` prevState

• **get prevState**(): *undefined | S*

获取本Model的前state状态，通常在effect中使用，当一个action同时引起reducer和effect执行时：
- 所有reducer会先执行完毕并更新rootState
- 之后才开始执行effect，此时effect中取到的rootState已经被reducer变更了
- 使用prevState可以取到reducer变更之前的state

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

- 模块被加载并初始化时将触发‘moduleName.Init’的action
- 此方法为该action的默认reducerHandler，通常用来注入初始化moduleState

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

- effect异步执行时，将自动派发‘moduleName.Loading’的action
- 此方法为该action的默认reducerHandler，通常用来在moduleState中注入loading状态

**Parameters:**

Name | Type |
------ | ------ |
`payload` | object |

**Returns:** *S*

___

###  RouteParams

▸ **RouteParams**(`payload`: object, `action?`: undefined | string): *S*

- 路由发生变化时如果路由中有该模块的routeParams，框架将自动为各个模块派发‘moduleName.RouteParams’的action
- 此方法为该action的默认reducerHandler，通常用来在moduleState中注入路由参数

**Parameters:**

Name | Type |
------ | ------ |
`payload` | object |
`action?` | undefined &#124; string |

**Returns:** *S*

___

### `Protected` Update

▸ **Update**(`payload`: S): *S*

通用的reducerHandler，通常用来更新moduleState

**Parameters:**

Name | Type |
------ | ------ |
`payload` | S |

**Returns:** *S*

___

### `Protected` callThisAction

▸ **callThisAction**<**T**>(`handler`: function, ...`rest`: T): *object*

对于某些仅供本模块内部使用的action，限制非public不对外开放.
所以即使this.actions也调用不到，此时可以使用callThisAction.
```
this.dispatch(this.callThisAction(this.anyPrivateHandle, args1, args2));
```

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

store.dispatch的引用

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

ie8不支持getter专用

**Returns:** *R*

___

### `Protected` getPrevState

▸ **getPrevState**(): *undefined | S*

ie8不支持getter专用

**Returns:** *undefined | S*

___

### `Protected` getRootState

▸ **getRootState**(): *R*

ie8不支持getter专用

**Returns:** *R*

___

### `Protected` getState

▸ **getState**(): *S*

ie8不支持getter专用

**Returns:** *S*

___

### `Protected` loadModel

▸ **loadModel**(`moduleName`: string, `options?`: any): *void | Promise‹void›*

动态加载并初始化其他模块的model

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | string |
`options?` | any |

**Returns:** *void | Promise‹void›*

___

### `Protected` updateState

▸ **updateState**(`payload`: Partial‹S›): *void*

一个快捷操作，相当于
```
this.dispatch(this.actions.Update({...this.state,...args}));
```

**Parameters:**

Name | Type |
------ | ------ |
`payload` | Partial‹S› |

**Returns:** *void*

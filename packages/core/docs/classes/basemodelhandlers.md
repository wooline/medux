[@medux/core - v0.2.37](../README.md) › [BaseModelHandlers](basemodelhandlers.md)

# Class: BaseModelHandlers <**S, R**>

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

* [beforeRootState](basemodelhandlers.md#protected-beforerootstate)
* [beforeState](basemodelhandlers.md#protected-beforestate)
* [currentRootState](basemodelhandlers.md#protected-currentrootstate)
* [currentState](basemodelhandlers.md#protected-currentstate)
* [rootState](basemodelhandlers.md#protected-rootstate)
* [state](basemodelhandlers.md#protected-state)

### Methods

* [Init](basemodelhandlers.md#protected-init)
* [Loading](basemodelhandlers.md#protected-loading)
* [RouteParams](basemodelhandlers.md#routeparams)
* [Update](basemodelhandlers.md#protected-update)
* [callThisAction](basemodelhandlers.md#protected-callthisaction)
* [dispatch](basemodelhandlers.md#protected-dispatch)
* [getBeforeRootState](basemodelhandlers.md#protected-getbeforerootstate)
* [getBeforeState](basemodelhandlers.md#protected-getbeforestate)
* [getCurrentRootState](basemodelhandlers.md#protected-getcurrentrootstate)
* [getCurrentState](basemodelhandlers.md#protected-getcurrentstate)
* [getRootState](basemodelhandlers.md#protected-getrootstate)
* [getState](basemodelhandlers.md#protected-getstate)
* [loadModel](basemodelhandlers.md#protected-loadmodel)
* [updateState](basemodelhandlers.md#protected-updatestate)

## Constructors

###  constructor

\+ **new BaseModelHandlers**(`moduleName`: string, `store`: ModelStore): *[BaseModelHandlers](basemodelhandlers.md)*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | string |
`store` | ModelStore |

**Returns:** *[BaseModelHandlers](basemodelhandlers.md)*

## Properties

### `Protected` actions

• **actions**: *[Actions](../README.md#actions)‹this›* = null as any

___

### `Protected` moduleName

• **moduleName**: *string*

___

### `Protected` store

• **store**: *ModelStore*

## Accessors

### `Protected` beforeRootState

• **get beforeRootState**(): *R*

**Returns:** *R*

___

### `Protected` beforeState

• **get beforeState**(): *undefined | S*

**Returns:** *undefined | S*

___

### `Protected` currentRootState

• **get currentRootState**(): *R*

**Returns:** *R*

___

### `Protected` currentState

• **get currentState**(): *S*

**Returns:** *S*

___

### `Protected` rootState

• **get rootState**(): *R*

**Returns:** *R*

___

### `Protected` state

• **get state**(): *S*

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

### `Protected` getBeforeRootState

▸ **getBeforeRootState**(): *R*

**Returns:** *R*

___

### `Protected` getBeforeState

▸ **getBeforeState**(): *undefined | S*

**Returns:** *undefined | S*

___

### `Protected` getCurrentRootState

▸ **getCurrentRootState**(): *R*

**Returns:** *R*

___

### `Protected` getCurrentState

▸ **getCurrentState**(): *S*

**Returns:** *S*

___

### `Protected` getRootState

▸ **getRootState**(): *R*

**Returns:** *R*

___

### `Protected` getState

▸ **getState**(): *S*

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

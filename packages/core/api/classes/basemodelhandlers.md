[@medux/core - v1.1.1-alpha.1](../README.md) › [BaseModelHandlers](basemodelhandlers.md)

# Class: BaseModelHandlers <**S, R**>

ModelHandlers 基类
所有 ModelHandlers 必须继承此基类

## Type parameters

▪ **S**: _[BaseModelState](../interfaces/basemodelstate.md)_

▪ **R**: _object_

## Hierarchy

- **BaseModelHandlers**

## Index

### Constructors

- [constructor](basemodelhandlers.md#constructor)

### Properties

- [actions](basemodelhandlers.md#protected-actions)
- [moduleName](basemodelhandlers.md#protected-modulename)
- [store](basemodelhandlers.md#protected-store)

### Accessors

- [currentRootState](basemodelhandlers.md#protected-currentrootstate)
- [currentState](basemodelhandlers.md#protected-currentstate)
- [prevRootState](basemodelhandlers.md#protected-prevrootstate)
- [prevState](basemodelhandlers.md#protected-prevstate)
- [rootState](basemodelhandlers.md#protected-rootstate)
- [state](basemodelhandlers.md#protected-state)

### Methods

- [Init](basemodelhandlers.md#protected-init)
- [Loading](basemodelhandlers.md#protected-loading)
- [RouteParams](basemodelhandlers.md#routeparams)
- [Update](basemodelhandlers.md#protected-update)
- [callThisAction](basemodelhandlers.md#protected-callthisaction)
- [dispatch](basemodelhandlers.md#protected-dispatch)
- [getCurrentRootState](basemodelhandlers.md#protected-getcurrentrootstate)
- [getCurrentState](basemodelhandlers.md#protected-getcurrentstate)
- [getPrevRootState](basemodelhandlers.md#protected-getprevrootstate)
- [getPrevState](basemodelhandlers.md#protected-getprevstate)
- [getRootState](basemodelhandlers.md#protected-getrootstate)
- [getState](basemodelhandlers.md#protected-getstate)
- [loadModel](basemodelhandlers.md#protected-loadmodel)
- [updateState](basemodelhandlers.md#protected-updatestate)

## Constructors

### constructor

\+ **new BaseModelHandlers**(`moduleName`: string, `store`: ModuleStore): _[BaseModelHandlers](basemodelhandlers.md)_

构造函数的参数将由框架自动传入

**Parameters:**

| Name         | Type        | Description           |
| ------------ | ----------- | --------------------- |
| `moduleName` | string      | 模块名称，不能重复    |
| `store`      | ModuleStore | 全局单例 Store 的引用 |

**Returns:** _[BaseModelHandlers](basemodelhandlers.md)_

## Properties

### `Protected` actions

• **actions**: _[Actions](../README.md#actions)‹this›_

- 引用本 module 的 actions
- this.actions 相当于 actions[this.moduleName]

---

### `Protected` moduleName

• **moduleName**: _string_

模块名称，不能重复

---

### `Protected` store

• **store**: _ModuleStore_

全局单例 Store 的引用

## Accessors

### `Protected` currentRootState

• **get currentRootState**(): _R_

获取整个 store 的实时 state，通常在 reducer 中使用，当一个 action 引起多个不同模块 reducer 执行时：

- state 会等到所有模块的 reducer 更新完成时才变化
- currentState 是实时更新变化

**Returns:** _R_

---

### `Protected` currentState

• **get currentState**(): _S_

- 获取本 Model 的实时 state，通常在 reducer 中使用，当一个 action 引起多个不同模块 reducer 执行时：
- state 会等到所有模块的 reducer 更新完成时才变化
- currentState 是实时更新变化

**Returns:** _S_

---

### `Protected` prevRootState

• **get prevRootState**(): _R_

获整个 store 的前 state 状态，通常在 effect 中使用，
当一个 action 同时引起 reducer 和 effect 执行时：

- 所有 reducer 会先执行完毕并更新 rootState
- 之后才开始执行 effect，此时 effect 中取到的 rootState 已经被 reducer 变更了
- 使用 prevState 可以取到 reducer 变更之前的 state

**Returns:** _R_

---

### `Protected` prevState

• **get prevState**(): _undefined | S_

获取本 Model 的前 state 状态，通常在 effect 中使用，当一个 action 同时引起 reducer 和 effect 执行时：

- 所有 reducer 会先执行完毕并更新 rootState
- 之后才开始执行 effect，此时 effect 中取到的 rootState 已经被 reducer 变更了
- 使用 prevState 可以取到 reducer 变更之前的 state

**Returns:** _undefined | S_

---

### `Protected` rootState

• **get rootState**(): _R_

获取整个 store 的 state

**Returns:** _R_

---

### `Protected` state

• **get state**(): _S_

获取本 Model 的 state

**Returns:** _S_

## Methods

### `Protected` Init

▸ **Init**(`initState`: S, `routeParams?`: any, `options?`: any): _S_

- 模块被加载并初始化时将触发‘moduleName.Init’的 action
- 此方法为该 action 的默认 reducerHandler，通常用来注入初始化 moduleState

**Parameters:**

| Name           | Type |
| -------------- | ---- |
| `initState`    | S    |
| `routeParams?` | any  |
| `options?`     | any  |

**Returns:** _S_

---

### `Protected` Loading

▸ **Loading**(`payload`: object): _S_

- effect 异步执行时，将自动派发‘moduleName.Loading’的 action
- 此方法为该 action 的默认 reducerHandler，通常用来在 moduleState 中注入 loading 状态

**Parameters:**

| Name      | Type   |
| --------- | ------ |
| `payload` | object |

**Returns:** _S_

---

### RouteParams

▸ **RouteParams**(`payload`: object, `action?`: undefined | string): _S_

- 路由发生变化时如果路由中有该模块的 routeParams，框架将自动为各个模块派发‘moduleName.RouteParams’的 action
- 此方法为该 action 的默认 reducerHandler，通常用来在 moduleState 中注入路由参数

**Parameters:**

| Name      | Type                    |
| --------- | ----------------------- |
| `payload` | object                  |
| `action?` | undefined &#124; string |

**Returns:** _S_

---

### `Protected` Update

▸ **Update**(`payload`: S): _S_

通用的 reducerHandler，通常用来更新 moduleState

**Parameters:**

| Name      | Type |
| --------- | ---- |
| `payload` | S    |

**Returns:** _S_

---

### `Protected` callThisAction

▸ **callThisAction**<**T**>(`handler`: function, ...`rest`: T): _object_

对于某些仅供本模块内部使用的 action，限制非 public 不对外开放.
所以即使 this.actions 也调用不到，此时可以使用 callThisAction.

```
this.dispatch(this.callThisAction(this.anyPrivateHandle, args1, args2));
```

**Type parameters:**

▪ **T**: _any[]_

**Parameters:**

▪ **handler**: _function_

▸ (...`args`: T): _any_

**Parameters:**

| Name      | Type |
| --------- | ---- |
| `...args` | T    |

▪... **rest**: _T_

**Returns:** _object_

- **payload**? : _any[]_

- **type**: _string_

---

### `Protected` dispatch

▸ **dispatch**(`action`: [Action](../interfaces/action.md)): _[Action](../interfaces/action.md) | Promise‹void›_

store.dispatch 的引用

**Parameters:**

| Name     | Type                              |
| -------- | --------------------------------- |
| `action` | [Action](../interfaces/action.md) |

**Returns:** _[Action](../interfaces/action.md) | Promise‹void›_

---

### `Protected` getCurrentRootState

▸ **getCurrentRootState**(): _R_

ie8 不支持 getter 专用

**Returns:** _R_

---

### `Protected` getCurrentState

▸ **getCurrentState**(): _S_

ie8 不支持 getter 专用

**Returns:** _S_

---

### `Protected` getPrevRootState

▸ **getPrevRootState**(): _R_

ie8 不支持 getter 专用

**Returns:** _R_

---

### `Protected` getPrevState

▸ **getPrevState**(): _undefined | S_

ie8 不支持 getter 专用

**Returns:** _undefined | S_

---

### `Protected` getRootState

▸ **getRootState**(): _R_

ie8 不支持 getter 专用

**Returns:** _R_

---

### `Protected` getState

▸ **getState**(): _S_

ie8 不支持 getter 专用

**Returns:** _S_

---

### `Protected` loadModel

▸ **loadModel**(`moduleName`: string, `options?`: any): _void | Promise‹void›_

动态加载并初始化其他模块的 model

**Parameters:**

| Name         | Type   |
| ------------ | ------ |
| `moduleName` | string |
| `options?`   | any    |

**Returns:** _void | Promise‹void›_

---

### `Protected` updateState

▸ **updateState**(`payload`: Partial‹S›): _void_

一个快捷操作，相当于

```
this.dispatch(this.actions.Update({...this.state,...args}));
```

**Parameters:**

| Name      | Type       |
| --------- | ---------- |
| `payload` | Partial‹S› |

**Returns:** _void_

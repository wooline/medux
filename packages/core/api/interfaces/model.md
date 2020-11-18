[@medux/core - v1.1.1-alpha.1](../README.md) › [Model](model.md)

# Interface: Model <**ModelState**>

模块 Model 的数据结构，该数据由 ExportModule 方法自动生成

## Type parameters

▪ **ModelState**: _[BaseModelState](basemodelstate.md)_

## Hierarchy

- **Model**

## Callable

▸ (`store`: ModuleStore, `options?`: any): _void | Promise‹void›_

model 初始化函数

- model 初始化时会触发 dispatch moduleName.Init 的 action，并返回执行结果

**Parameters:**

| Name       | Type        | Description                                  |
| ---------- | ----------- | -------------------------------------------- |
| `store`    | ModuleStore | Store 的引用                                 |
| `options?` | any         | 该数据将与 initState 合并注入 model 初始状态 |

**Returns:** _void | Promise‹void›_

如果模块已经初始化过，不再重复初始化并返回 void，否则返回 Promise

## Index

### Properties

- [initState](model.md#initstate)
- [moduleName](model.md#modulename)

## Properties

### initState

• **initState**: _ModelState_

---

### moduleName

• **moduleName**: _string_

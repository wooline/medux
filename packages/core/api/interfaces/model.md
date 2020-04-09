[@medux/core - v0.2.38](../README.md) › [Model](model.md)

# Interface: Model <**ModelState**>

模块Model的数据结构，该数据由ExportModule方法自动生成

## Type parameters

▪ **ModelState**: *[BaseModelState](basemodelstate.md)*

## Hierarchy

* **Model**

## Callable

▸ (`store`: ModelStore, `options?`: any): *void | Promise‹void›*

model初始化函数
- model初始化时会触发dispatch moduleName.Init的action，并返回执行结果

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`store` | ModelStore | Store的引用 |
`options?` | any | 该数据将与initState合并注入model初始状态 |

**Returns:** *void | Promise‹void›*

如果模块已经初始化过，不再重复初始化并返回void，否则返回Promise

## Index

### Properties

* [initState](model.md#initstate)
* [moduleName](model.md#modulename)

## Properties

###  initState

• **initState**: *ModelState*

___

###  moduleName

• **moduleName**: *string*

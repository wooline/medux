[@medux/core - v0.2.39](../README.md) › [BaseModelState](basemodelstate.md)

# Interface: BaseModelState <**R**>

所有ModuleState的固定属性

## Type parameters

▪ **R**

## Hierarchy

* **BaseModelState**

## Index

### Properties

* [isModule](basemodelstate.md#optional-ismodule)
* [loading](basemodelstate.md#optional-loading)
* [routeParams](basemodelstate.md#optional-routeparams)

## Properties

### `Optional` isModule

• **isModule**? : *undefined | false | true*

因为rootState节点下可能存在各个moduleState，也可能存在其他reducers
- isModule用来标识该节点是一个moduleState，该标识由框架自动生成

___

### `Optional` loading

• **loading**? : *undefined | object*

该模块的各种loading状态，执行effect时会自动注入loading状态

___

### `Optional` routeParams

• **routeParams**? : *R*

由该模块抽离出的路由信息状态
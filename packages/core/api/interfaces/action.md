[@medux/core - v1.1.0](../README.md) › [Action](action.md)

# Interface: Action

Medux自动创建的action载体，比redux的action载体多一个priority属性

因为一个action可以触发多个模块的actionHandler，priority属性用来设置handlers的优先处理顺序，通常无需设置

## Hierarchy

* **Action**

## Index

### Properties

* [payload](action.md#optional-payload)
* [priority](action.md#optional-priority)
* [type](action.md#type)

## Properties

### `Optional` payload

• **payload**? : *any[]*

___

### `Optional` priority

• **priority**? : *string[]*

priority属性用来设置handlers的优先处理顺序，值为moduleName[]

___

###  type

• **type**: *string*

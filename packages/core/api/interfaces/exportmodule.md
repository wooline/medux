[@medux/core - v0.2.38](../README.md) › [ExportModule](exportmodule.md)

# Interface: ExportModule <**Component**>

## Type parameters

▪ **Component**

## Hierarchy

* **ExportModule**

## Callable

▸ <**S**, **V**, **T**, **N**>(`moduleName`: N, `initState`: S, `ActionHandles`: object, `views`: V): *Module<Model&lt;S&gt;, V, Actions&lt;T&gt;, N>["default"]*

导出Module

**Type parameters:**

▪ **S**: *[BaseModelState](basemodelstate.md)*

▪ **V**: *object*

▪ **T**: *[BaseModelHandlers](../classes/basemodelhandlers.md)‹S, any›*

▪ **N**: *string*

**Parameters:**

▪ **moduleName**: *N*

模块名，不能重复

▪ **initState**: *S*

模块初始状态

▪ **ActionHandles**: *object*

模块的ModelHandlers类，必须继承BaseModelHandlers

Name | Type |
------ | ------ |
`constructor` |  |

▪ **views**: *V*

模块需要导出给外部使用的View，若无需给外部使用可不导出

**Returns:** *Module<Model&lt;S&gt;, V, Actions&lt;T&gt;, N>["default"]*

medux定义的module标准数据结构

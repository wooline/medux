[@medux/core - v0.2.38](../README.md) › [LoadView](loadview.md)

# Interface: LoadView <**MG, Options, Comp**>

## Type parameters

▪ **MG**: *[ModuleGetter](modulegetter.md)*

▪ **Options**

▪ **Comp**

## Hierarchy

* **LoadView**

## Callable

▸ <**M**, **V**, **N**>(`moduleName`: M, `viewName`: N, `options?`: Options, `loading?`: Comp, `error?`: Comp): *V[N]*

动态加载View，因为每种UI框架动态加载View的方式不一样，所有此处只是提供一个抽象接口

**`see`** getView

**Type parameters:**

▪ **M**: *Extract‹keyof MG, string›*

▪ **V**: *ModuleViews‹ReturnModule‹MG[M]››*

▪ **N**: *Extract‹keyof V, string›*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | M |
`viewName` | N |
`options?` | Options |
`loading?` | Comp |
`error?` | Comp |

**Returns:** *V[N]*

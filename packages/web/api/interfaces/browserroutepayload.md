[@medux/web - v0.2.38](../README.md) › [BrowserRoutePayload](browserroutepayload.md)

# Interface: BrowserRoutePayload <**P**>

定义一种数据结构，根据此结构可以生成一个url

## Type parameters

▪ **P**

## Hierarchy

* **BrowserRoutePayload**

## Index

### Properties

* [extend](browserroutepayload.md#optional-extend)
* [params](browserroutepayload.md#optional-params)
* [paths](browserroutepayload.md#optional-paths)

## Properties

### `Optional` extend

• **extend**? : *RouteData*

可以继承一个RouteData

___

### `Optional` params

• **params**? : *DeepPartial‹P›*

将和继承的RouteData合并merge

___

### `Optional` paths

• **paths**? : *string[]*

要展示的Views

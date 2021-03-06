[@medux/core - v1.1.1-alpha.1](../README.md) › [RouteData](routedata.md)

# Interface: RouteData

框架内部使用的路由数据结构
- 用户需要通过HistoryProxy将宿主的路由数据结构转换为此数据结构

## Hierarchy

* **RouteData**

## Index

### Properties

* [action](routedata.md#optional-action)
* [params](routedata.md#params)
* [paths](routedata.md#paths)
* [views](routedata.md#views)

## Properties

### `Optional` action

• **action**? : *undefined | string*

路由的打开方式

___

###  params

• **params**: *object*

表示当前路由传递了哪些参数

#### Type declaration:

* \[ **moduleName**: *string*\]: object | undefined

___

###  paths

• **paths**: *string[]*

表示当前路由下加载views的父子嵌套关系

___

###  views

• **views**: *[DisplayViews](displayviews.md)*

表示当前路由下加载了哪些views

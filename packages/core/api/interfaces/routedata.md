[@medux/core - v1.0.4](../README.md) › [RouteData](routedata.md)

# Interface: RouteData

框架内部使用的路由数据结构
- 用户需要通过HistoryProxy将宿主的路由数据结构转换为此数据结构

## Hierarchy

* **RouteData**

## Index

### Properties

* [params](routedata.md#params)
* [paths](routedata.md#paths)
* [stackParams](routedata.md#stackparams)
* [views](routedata.md#views)

## Properties

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

###  stackParams

• **stackParams**: *object[]*

如果存在多个路由栈（如APP）每个路由栈上分别保存什么数据

___

###  views

• **views**: *[DisplayViews](displayviews.md)*

表示当前路由下加载了哪些views

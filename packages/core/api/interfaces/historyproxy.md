[@medux/core - v0.2.39](../README.md) › [HistoryProxy](historyproxy.md)

# Interface: HistoryProxy <**L**>

路由抽象代理。
- 路由系统通常由宿主平台自己提供，由于各个平台的路由实现方式不同，为了支持跨平台使用，框架抽象了路由代理
- 该代理用来实现medux与宿主路由系统的对接

## Type parameters

▪ **L**

## Hierarchy

* **HistoryProxy**

## Index

### Properties

* [initialized](historyproxy.md#initialized)

### Methods

* [equal](historyproxy.md#equal)
* [getLocation](historyproxy.md#getlocation)
* [locationToRouteData](historyproxy.md#locationtoroutedata)
* [patch](historyproxy.md#patch)
* [subscribe](historyproxy.md#subscribe)

## Properties

###  initialized

• **initialized**: *boolean*

是否初始化完成了，有些平台路由自动被初始化，如web。有些平台路由需要手动代理，如app

## Methods

###  equal

▸ **equal**(`a`: L, `b`: L): *boolean*

对比2个宿主路由系统的原始数据是否相同

**Parameters:**

Name | Type |
------ | ------ |
`a` | L |
`b` | L |

**Returns:** *boolean*

___

###  getLocation

▸ **getLocation**(): *L*

宿主路由系统的原始数据

**Returns:** *L*

___

###  locationToRouteData

▸ **locationToRouteData**(`location`: L): *[RouteData](routedata.md)*

宿主路由系统的原始数据转换为medux的RouteData

**Parameters:**

Name | Type |
------ | ------ |
`location` | L |

**Returns:** *[RouteData](routedata.md)*

___

###  patch

▸ **patch**(`location`: L, `routeData`: [RouteData](routedata.md)): *void*

- 通常情况下，宿主路由系统的变化引起应用的路由变化
- inTimeTravelling时，应用的路由变化反过来带动宿主路由系统的变化

**Parameters:**

Name | Type |
------ | ------ |
`location` | L |
`routeData` | [RouteData](routedata.md) |

**Returns:** *void*

___

###  subscribe

▸ **subscribe**(`listener`: function): *function*

监听宿主路由系统的变化

**Parameters:**

▪ **listener**: *function*

▸ (`location`: L): *void*

**Parameters:**

Name | Type |
------ | ------ |
`location` | L |

**Returns:** *function*

卸载监听

▸ (): *void*

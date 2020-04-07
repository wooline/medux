[@medux/core - v0.2.37](../README.md) › [HistoryProxy](historyproxy.md)

# Interface: HistoryProxy <**L**>

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

## Methods

###  equal

▸ **equal**(`a`: L, `b`: L): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`a` | L |
`b` | L |

**Returns:** *boolean*

___

###  getLocation

▸ **getLocation**(): *L*

**Returns:** *L*

___

###  locationToRouteData

▸ **locationToRouteData**(`location`: L): *[RouteData](routedata.md)*

**Parameters:**

Name | Type |
------ | ------ |
`location` | L |

**Returns:** *[RouteData](routedata.md)*

___

###  patch

▸ **patch**(`location`: L, `routeData`: [RouteData](routedata.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`location` | L |
`routeData` | [RouteData](routedata.md) |

**Returns:** *void*

___

###  subscribe

▸ **subscribe**(`listener`: function): *void*

**Parameters:**

▪ **listener**: *function*

▸ (`location`: L): *void*

**Parameters:**

Name | Type |
------ | ------ |
`location` | L |

**Returns:** *void*

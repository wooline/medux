[@medux/route-plan-a - v1.0.7-alpha.13](README.md)

# @medux/route-plan-a - v1.0.7-alpha.13

## Index

### Interfaces

* [MeduxLocation](interfaces/meduxlocation.md)
* [RouteConfig](interfaces/routeconfig.md)
* [RoutePayload](interfaces/routepayload.md)
* [TransformRoute](interfaces/transformroute.md)

### Type aliases

* [LocationToRoute](README.md#locationtoroute)
* [RouteToLocation](README.md#routetolocation)

### Variables

* [deepAssign](README.md#const-deepassign)

### Functions

* [assignRouteData](README.md#assignroutedata)
* [buildTransformRoute](README.md#buildtransformroute)
* [checkUrl](README.md#checkurl)
* [fillRouteData](README.md#fillroutedata)
* [locationToUrl](README.md#locationtourl)
* [setRouteConfig](README.md#setrouteconfig)
* [urlToLocation](README.md#urltolocation)

## Type aliases

###  LocationToRoute

Ƭ **LocationToRoute**: *function*

将浏览器的Location转换为medux内部使用的RouteData

#### Type declaration:

▸ (`location`: [MeduxLocation](interfaces/meduxlocation.md)): *RouteData*

**Parameters:**

Name | Type |
------ | ------ |
`location` | [MeduxLocation](interfaces/meduxlocation.md) |

___

###  RouteToLocation

Ƭ **RouteToLocation**: *function*

将medux内部使用的RouteData转换为浏览器的Location

#### Type declaration:

▸ (`routeData`: RouteData): *[MeduxLocation](interfaces/meduxlocation.md)*

**Parameters:**

Name | Type |
------ | ------ |
`routeData` | RouteData |

## Variables

### `Const` deepAssign

• **deepAssign**: *deepExtend* = assignDeep

一个深度拷贝的方法

## Functions

###  assignRouteData

▸ **assignRouteData**(`paths`: string[], `stackParams`: object[], `args?`: undefined | object, `action?`: undefined | string): *RouteData*

**Parameters:**

Name | Type |
------ | ------ |
`paths` | string[] |
`stackParams` | object[] |
`args?` | undefined &#124; object |
`action?` | undefined &#124; string |

**Returns:** *RouteData*

___

###  buildTransformRoute

▸ **buildTransformRoute**(`routeConfig`: [RouteConfig](interfaces/routeconfig.md)): *[TransformRoute](interfaces/transformroute.md)*

创建一个浏览器的Location与medux内部使用的RouteData相互转换器

**Parameters:**

Name | Type |
------ | ------ |
`routeConfig` | [RouteConfig](interfaces/routeconfig.md) |

**Returns:** *[TransformRoute](interfaces/transformroute.md)*

转换器

___

###  checkUrl

▸ **checkUrl**(`url`: string, `curPathname`: string): *string*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`url` | string | - |
`curPathname` | string | "" |

**Returns:** *string*

___

###  fillRouteData

▸ **fillRouteData**<**R**>(`routePayload`: [RoutePayload](interfaces/routepayload.md)‹R›): *RouteData*

**Type parameters:**

▪ **R**

**Parameters:**

Name | Type |
------ | ------ |
`routePayload` | [RoutePayload](interfaces/routepayload.md)‹R› |

**Returns:** *RouteData*

___

###  locationToUrl

▸ **locationToUrl**(`location`: [MeduxLocation](interfaces/meduxlocation.md)): *string*

**Parameters:**

Name | Type |
------ | ------ |
`location` | [MeduxLocation](interfaces/meduxlocation.md) |

**Returns:** *string*

___

###  setRouteConfig

▸ **setRouteConfig**(`conf`: object): *void*

可以配置的参数
- escape 是否对生成的url进行escape编码
- dateParse 是否自动解析url中的日期格式
- splitKey 使用一个key来作为数据的载体
- defaultRouteParams 默认的路由参数

**Parameters:**

▪ **conf**: *object*

Name | Type |
------ | ------ |
`dateParse?` | undefined &#124; false &#124; true |
`defaultRouteParams?` | undefined &#124; object |
`escape?` | undefined &#124; false &#124; true |
`splitKey?` | undefined &#124; string |

**Returns:** *void*

___

###  urlToLocation

▸ **urlToLocation**(`url`: string): *[MeduxLocation](interfaces/meduxlocation.md)*

**Parameters:**

Name | Type |
------ | ------ |
`url` | string |

**Returns:** *[MeduxLocation](interfaces/meduxlocation.md)*

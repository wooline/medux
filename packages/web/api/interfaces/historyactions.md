[@medux/web - v0.2.38](../README.md) › [HistoryActions](historyactions.md)

# Interface: HistoryActions <**P**>

经过封装后的HistoryAPI比浏览器自带的history更强大

## Type parameters

▪ **P**

## Hierarchy

* **HistoryActions**

## Index

### Methods

* [getLocation](historyactions.md#getlocation)
* [getRouteData](historyactions.md#getroutedata)
* [go](historyactions.md#go)
* [goBack](historyactions.md#goback)
* [goForward](historyactions.md#goforward)
* [listen](historyactions.md#listen)
* [push](historyactions.md#push)
* [replace](historyactions.md#replace)

## Methods

###  getLocation

▸ **getLocation**(): *MeduxLocation*

获取当前路由的原始路由数据

**Returns:** *MeduxLocation*

___

###  getRouteData

▸ **getRouteData**(): *RouteData*

获取当前路由的经过转换之后的路由数据

**Returns:** *RouteData*

___

###  go

▸ **go**(`n`: number): *void*

同浏览器的history.go

**Parameters:**

Name | Type |
------ | ------ |
`n` | number |

**Returns:** *void*

___

###  goBack

▸ **goBack**(): *void*

同浏览器的history.goBack

**Returns:** *void*

___

###  goForward

▸ **goForward**(): *void*

同浏览器的history.goForward

**Returns:** *void*

___

###  listen

▸ **listen**(`listener`: LocationListener‹never›): *UnregisterCallback*

接受监听回调

**Parameters:**

Name | Type |
------ | ------ |
`listener` | LocationListener‹never› |

**Returns:** *UnregisterCallback*

___

###  push

▸ **push**(`data`: [BrowserRoutePayload](browserroutepayload.md)‹P› | MeduxLocation | string): *void*

同浏览器的history.push方法

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`data` | [BrowserRoutePayload](browserroutepayload.md)‹P› &#124; MeduxLocation &#124; string | 除了可以接受一个url字符串外，也可以接受medux的RouteData  |

**Returns:** *void*

___

###  replace

▸ **replace**(`data`: [BrowserRoutePayload](browserroutepayload.md)‹P› | MeduxLocation | string): *void*

同浏览器的history.replace

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`data` | [BrowserRoutePayload](browserroutepayload.md)‹P› &#124; MeduxLocation &#124; string | 除了可以接受一个url字符串外，也可以接受medux的RouteData  |

**Returns:** *void*

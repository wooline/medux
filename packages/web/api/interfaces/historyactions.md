[@medux/web - v0.2.38](../README.md) › [HistoryActions](historyactions.md)

# Interface: HistoryActions <**P**>

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

**Returns:** *MeduxLocation*

___

###  getRouteData

▸ **getRouteData**(): *RouteData*

**Returns:** *RouteData*

___

###  go

▸ **go**(`n`: number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`n` | number |

**Returns:** *void*

___

###  goBack

▸ **goBack**(): *void*

**Returns:** *void*

___

###  goForward

▸ **goForward**(): *void*

**Returns:** *void*

___

###  listen

▸ **listen**(`listener`: LocationListener‹never›): *UnregisterCallback*

**Parameters:**

Name | Type |
------ | ------ |
`listener` | LocationListener‹never› |

**Returns:** *UnregisterCallback*

___

###  push

▸ **push**(`data`: [BrowserRoutePayload](browserroutepayload.md)‹P› | MeduxLocation | string): *void*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [BrowserRoutePayload](browserroutepayload.md)‹P› &#124; MeduxLocation &#124; string |

**Returns:** *void*

___

###  replace

▸ **replace**(`data`: [BrowserRoutePayload](browserroutepayload.md)‹P› | MeduxLocation | string): *void*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [BrowserRoutePayload](browserroutepayload.md)‹P› &#124; MeduxLocation &#124; string |

**Returns:** *void*

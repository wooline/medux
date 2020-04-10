[@medux/web - v0.2.38](README.md)

# @medux/web - v0.2.38

## Index

### Interfaces

* [BrowserRoutePayload](interfaces/browserroutepayload.md)
* [HistoryActions](interfaces/historyactions.md)
* [ToBrowserUrl](interfaces/tobrowserurl.md)

### Functions

* [createBrowserHistory](README.md#createbrowserhistory)
* [createHashHistory](README.md#createhashhistory)
* [createMemoryHistory](README.md#creatememoryhistory)
* [createRouter](README.md#createrouter)
* [fillBrowserRouteData](README.md#fillbrowserroutedata)

## Functions

###  createBrowserHistory

▸ **createBrowserHistory**<**S**>(`options?`: BrowserHistoryBuildOptions): *History‹S›*

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type |
------ | ------ |
`options?` | BrowserHistoryBuildOptions |

**Returns:** *History‹S›*

___

###  createHashHistory

▸ **createHashHistory**<**S**>(`options?`: HashHistoryBuildOptions): *History‹S›*

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type |
------ | ------ |
`options?` | HashHistoryBuildOptions |

**Returns:** *History‹S›*

___

###  createMemoryHistory

▸ **createMemoryHistory**<**S**>(`options?`: MemoryHistoryBuildOptions): *MemoryHistory‹S›*

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type |
------ | ------ |
`options?` | MemoryHistoryBuildOptions |

**Returns:** *MemoryHistory‹S›*

___

###  createRouter

▸ **createRouter**(`history`: History, `routeConfig`: RouteConfig): *object*

**Parameters:**

Name | Type |
------ | ------ |
`history` | History |
`routeConfig` | RouteConfig |

**Returns:** *object*

* **historyActions**: *[HistoryActions](interfaces/historyactions.md)‹object›*

* **historyProxy**: *HistoryProxy‹BrowserLocation›*

* **toBrowserUrl**: *[ToBrowserUrl](interfaces/tobrowserurl.md)‹object›*

* **transformRoute**: *TransformRoute*

___

###  fillBrowserRouteData

▸ **fillBrowserRouteData**(`routePayload`: [BrowserRoutePayload](interfaces/browserroutepayload.md)): *RouteData*

**Parameters:**

Name | Type |
------ | ------ |
`routePayload` | [BrowserRoutePayload](interfaces/browserroutepayload.md) |

**Returns:** *RouteData*

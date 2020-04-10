[@medux/web - v0.2.38](../README.md) › [ToBrowserUrl](tobrowserurl.md)

# Interface: ToBrowserUrl <**T**>

将一个内部RouteData序列化为一个url

## Type parameters

▪ **T**

## Hierarchy

* **ToBrowserUrl**

## Callable

▸ (`routeOptions`: [BrowserRoutePayload](browserroutepayload.md)‹T›): *string*

将一个内部RouteData序列化为一个url

**Parameters:**

Name | Type |
------ | ------ |
`routeOptions` | [BrowserRoutePayload](browserroutepayload.md)‹T› |

**Returns:** *string*

▸ (`pathname`: string, `search`: string, `hash`: string): *string*

将一个内部RouteData序列化为一个url

**Parameters:**

Name | Type |
------ | ------ |
`pathname` | string |
`search` | string |
`hash` | string |

**Returns:** *string*

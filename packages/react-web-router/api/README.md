[@medux/react-web-router - v0.2.38](README.md)

# @medux/react-web-router - v0.2.38

## Index

### Enumerations

* [LoadingState](enums/loadingstate.md)

### Classes

* [BaseModelHandlers](classes/basemodelhandlers.md)

### Interfaces

* [BaseModelState](interfaces/basemodelstate.md)
* [LinkProps](interfaces/linkprops.md)
* [RouteConfig](interfaces/routeconfig.md)
* [RouteData](interfaces/routedata.md)

### Type aliases

* [Actions](README.md#actions)
* [BrowserRouter](README.md#browserrouter)
* [LoadView](README.md#loadview)
* [RootState](README.md#rootstate)
* [RouteViews](README.md#routeviews)

### Variables

* [ActionTypes](README.md#const-actiontypes)
* [Link](README.md#const-link)
* [exportModule](README.md#const-exportmodule)
* [loadView](README.md#const-loadview)

### Functions

* [Switch](README.md#const-switch)
* [buildApp](README.md#buildapp)
* [buildSSR](README.md#buildssr)
* [delayPromise](README.md#delaypromise)
* [effect](README.md#effect)
* [errorAction](README.md#erroraction)
* [exportActions](README.md#exportactions)
* [modelHotReplacement](README.md#modelhotreplacement)
* [reducer](README.md#reducer)
* [setRouteConfig](README.md#setrouteconfig)
* [viewHotReplacement](README.md#viewhotreplacement)

## Type aliases

###  Actions

Ƭ **Actions**: *object*

#### Type declaration:

___

###  BrowserRouter

Ƭ **BrowserRouter**: *object*

#### Type declaration:

* **historyActions**: *HistoryActions‹Params›*

* **toUrl**: *ToBrowserUrl‹Params›*

* **transformRoute**: *TransformRoute*

___

###  LoadView

Ƭ **LoadView**: *LoadView‹T, object, ComponentType‹any››*

___

###  RootState

Ƭ **RootState**: *BaseRootState‹G, MeduxLocation›*

___

###  RouteViews

Ƭ **RouteViews**: *object*

#### Type declaration:

## Variables

### `Const` ActionTypes

• **ActionTypes**: *object*

#### Type declaration:

* **Error**: *string*

* **MInit**: *string*

* **MLoading**: *string*

* **MRouteParams**: *string*

* **RouteChange**: *string*

___

### `Const` Link

• **Link**: *ForwardRefExoticComponent‹[LinkProps](interfaces/linkprops.md)‹› & RefAttributes‹HTMLAnchorElement››* = React.forwardRef<HTMLAnchorElement, LinkProps>(({onClick, replace, ...rest}, ref) => {
  const {target} = rest;
  const props = {
    ...rest,
    onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      try {
        onClick && onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (
        !event.defaultPrevented && // onClick prevented default
        event.button === 0 && // ignore everything but left clicks
        (!target || target === '_self') && // let browser handle "target=_blank" etc.
        !isModifiedEvent(event) // ignore clicks with modifier keys
      ) {
        event.preventDefault();
        replace ? historyActions!.replace(rest.href!) : historyActions!.push(rest.href!);
      }
    },
  };
  return <a {...props} ref={ref} />;
})

___

### `Const` exportModule

• **exportModule**: *ExportModule‹ComponentType‹any››*

___

### `Const` loadView

• **loadView**: *LoadView‹any›*

## Functions

### `Const` Switch

▸ **Switch**(`__namedParameters`: object): *Element‹›*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`children` | undefined &#124; null &#124; string &#124; number &#124; false &#124; true &#124; object &#124; ReactElement‹any, string &#124; function &#124; object› &#124; ReactNodeArray‹› &#124; ReactPortal‹› |
`elseView` | undefined &#124; null &#124; string &#124; number &#124; false &#124; true &#124; object &#124; ReactElement‹any, string &#124; function &#124; object› &#124; ReactNodeArray‹› &#124; ReactPortal‹› |

**Returns:** *Element‹›*

___

###  buildApp

▸ **buildApp**(`__namedParameters`: object): *Promise‹void›*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type | Default |
------ | ------ | ------ |
`appModuleName` | string | - |
`beforeRender` | undefined &#124; function | - |
`container` | string &#124; Element &#124; function | "root" |
`defaultRouteParams` | undefined &#124; object | - |
`history` | History‹undefined &#124; null &#124; object› | - |
`moduleGetter` | ModuleGetter | - |
`routeConfig` | [RouteConfig](interfaces/routeconfig.md) | - |
`storeOptions` | StoreOptions | - |

**Returns:** *Promise‹void›*

___

###  buildSSR

▸ **buildSSR**(`__namedParameters`: object): *Promise‹object›*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type | Default |
------ | ------ | ------ |
`appModuleName` | string | - |
`beforeRender` | undefined &#124; function | - |
`defaultRouteParams` | undefined &#124; object | - |
`location` | string | - |
`moduleGetter` | ModuleGetter | - |
`renderToStream` | boolean | false |
`routeConfig` | [RouteConfig](interfaces/routeconfig.md) | - |
`storeOptions` | StoreOptions | - |

**Returns:** *Promise‹object›*

___

###  delayPromise

▸ **delayPromise**(`second`: number): *function*

**Parameters:**

Name | Type |
------ | ------ |
`second` | number |

**Returns:** *function*

▸ (`target`: any, `key`: string, `descriptor`: PropertyDescriptor): *void*

**Parameters:**

Name | Type |
------ | ------ |
`target` | any |
`key` | string |
`descriptor` | PropertyDescriptor |

___

###  effect

▸ **effect**(`loadingForGroupName?`: string | null, `loadingForModuleName?`: undefined | string): *function*

**Parameters:**

Name | Type |
------ | ------ |
`loadingForGroupName?` | string &#124; null |
`loadingForModuleName?` | undefined &#124; string |

**Returns:** *function*

▸ (`target`: any, `key`: string, `descriptor`: PropertyDescriptor): *any*

**Parameters:**

Name | Type |
------ | ------ |
`target` | any |
`key` | string |
`descriptor` | PropertyDescriptor |

___

###  errorAction

▸ **errorAction**(`error`: any): *object*

**Parameters:**

Name | Type |
------ | ------ |
`error` | any |

**Returns:** *object*

* **payload**: *any[]*

* **type**: *string*

___

###  exportActions

▸ **exportActions**<**G**>(`moduleGetter`: G): *object*

**Type parameters:**

▪ **G**: *object*

**Parameters:**

Name | Type |
------ | ------ |
`moduleGetter` | G |

**Returns:** *object*

___

###  modelHotReplacement

▸ **modelHotReplacement**(`moduleName`: string, `initState`: any, `ActionHandles`: object): *void*

**Parameters:**

▪ **moduleName**: *string*

▪ **initState**: *any*

▪ **ActionHandles**: *object*

Name | Type |
------ | ------ |
`constructor` |  |

**Returns:** *void*

___

###  reducer

▸ **reducer**(`target`: any, `key`: string, `descriptor`: PropertyDescriptor): *any*

**Parameters:**

Name | Type |
------ | ------ |
`target` | any |
`key` | string |
`descriptor` | PropertyDescriptor |

**Returns:** *any*

___

###  setRouteConfig

▸ **setRouteConfig**(`conf`: object): *void*

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

###  viewHotReplacement

▸ **viewHotReplacement**(`moduleName`: string, `views`: object): *void*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | string |
`views` | object |

**Returns:** *void*

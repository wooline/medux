[@medux/core - v1.0.7-alpha.12](../README.md) › [LoadingState](loadingstate.md)

# Enumeration: LoadingState

Loading状态，可通过effect注入，也可通过setLoading注入
同一时段同一分组的多个loading状态会自动合并

## Index

### Enumeration members

* [Depth](loadingstate.md#depth)
* [Start](loadingstate.md#start)
* [Stop](loadingstate.md#stop)

## Enumeration members

###  Depth

• **Depth**: = "Depth"

开始深度加载，对于加载时间超过setLoadingDepthTime设置值时将转为深度加载状态

___

###  Start

• **Start**: = "Start"

开始加载.

___

###  Stop

• **Stop**: = "Stop"

加载完成.

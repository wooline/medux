[@medux/core - v0.2.39](../README.md) › [DisplayViews](displayviews.md)

# Interface: DisplayViews

描述当前路由展示了哪些模块的哪些view，例如：
```
{
   app: {
       Main: true,
       List: true
   },
   article: {
       Details: true
   }
}
```

## Hierarchy

* **DisplayViews**

## Indexable

* \[ **moduleName**: *string*\]: object | undefined

描述当前路由展示了哪些模块的哪些view，例如：
```
{
   app: {
       Main: true,
       List: true
   },
   article: {
       Details: true
   }
}
```
#### vue2 和 vue3 响应式原理

##### vue2: Object.defineProperty(obj, key, options)

存在的一些问题：

- 响应化过程需要遍历 data、props 等，消耗较大
- 不支持 Set/Map、数组等类型
- 新加或删除属性无法监听
- 数组响应化需要额外实现\$set

##### vue3: [proxy](https://www.yuque.com/ostwind/es6/docs-proxy)

```js
// proxy相当于在对象外层添加一层拦截
// Reflect用于执行对象的默认操作， 参考https://www.yuque.com/ostwind/es6/docs-reflect
function reactive(data) {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  const observer = new Proxy(data, {
    get(target, key, receiver) {
      console.log(`获取${key}: ${Reflect.get(target, key, receiver)}`)
      const val = Reflect.get(target, key, receiver);
      return typeof val === 'object'? reactive(val): val
    },
    set(target, key, value, receiver) {
      console.log(`设置${key}: ${Reflect.set(target, key, value, receiver)}`)
      return Reflect.set(target, key, value, receiver);
    },
    deleteProperty(target, key) {
      console.log(`删除${key}`)
      return Reflect.deleteProperty(target, key)
    }
  })
  return observer
}
```

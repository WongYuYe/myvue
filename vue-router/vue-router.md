### vue-router
vue-router有两种模式，一种为hash(默认)，另一种为history。mode: "[hash|history]"
##### hash模式
\#就是hash符号，中文名为哈希符或锚点。路由的hash模式是利用windos可以监听onhashchange事件，及#后面的hash值发生变化，作一些响应，
##### history模式
利用h5的属性：pushState和replaceState。这两个属性可以将url替换但是不刷新页面，http并没有实际去请求这个路径的资源，一旦刷新就会报404。
如何解决404？需要服务端将不存在的路径重定向到入口文件(index.html)。

### 生命周期
#### new Vue() 初始化vue实例
初始化事件&生命周期

#### beforeCreate
初始化注入&校验，数据绑定

#### created
查看new Vue(options)，options对象是否有el项，如果没有，则需要调用vm.$mount(el)挂在到el上，如果有，则再判断是否指定了template选项，有template则将template编译到render函数中，无则将el外部的HTML作为template编译。
el?el: 调用vm.$mount(el) -> template? template: el
因此template的优先级高于el

#### beforeMount
创建vm.$el并用其替换"el"，即挂载到el上，虚拟的

#### mounted
真实DOM挂载完毕，可对data进行修改

#### beforeUpdate
virtual dom重新渲染并更新

#### updated
更新完毕

#### beforeDestroy
解除绑定，销毁子组件及事件监听器，直到销毁完毕

#### destroyed
周期结束

[详解Vue生命周期](https://segmentfault.com/a/1190000011381906#comment-area)
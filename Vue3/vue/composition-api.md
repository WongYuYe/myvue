##### 事例
```
<div id="app"></div>
<script src="./vue.global.js"></script>
<script>
const { createApp, reactive, couputed, toRefs, watch } = Vue
const App = {
  template: "
    <div>count: {{ count }}</div>
    <div>doubleCount: {{ doubleCount }}</div>
    <div>price: {{ price }}</div>
  ",
  setup() {
    // 申明state对象
    const state = reactive({
      count: 0,
      // 计算属性
      doubleCount: couputed(() => state.count * 2)
    })
    // 方法
    function add() {
      state.count ++
    }
    // 监听所有属性
    watchEffect(() => console.log(state.count))
    // 监听单个或多个属性watch(source, fn, options?)
    watch(
      () => state.count,
      (count, preCount) => { console.log(count, preCount) }
    )
    // 申明ref对象
    const price = ref(10)

    return { ...toRefs(state), add, price }
  }
}
createApp(APP).mount('#app')
</script>
```
#### 组件间通信

- 父子组件通信：本质通过父组件传递数据和方法，子组件展示数据，通过$emit调用父组件方法

```js
<!-- 父组件 -->
<template>
  <div @click = "parentAdd">加1</div>
  <child-con :count = "count" @addCount = "parentAdd" />
</template>

<script>
  export default Parent{
    data() {
      return {
        count: 0
      }
    },
    methods: {
      parentAdd() {
        this.count ++
      }
    }
  }
</script>

<!-- 子组件 -->
<template>
  <div @click = "childAdd">加1</div>
  <div>{{ count }}</div>
</template>

<script>
  export default Parent{
    props: {
      count: {
        type: Number,
        default: 0
      }
    },
    methods: {
      childAdd() {
        this.$emit('addCount')
      }
    }
  }
</script>
```

- 组件间通信：Bus中央事件总线

```js
<!-- main.js -->
const vm = new Vue({
  el,
  render: h => h(app),
  data: {
    Bus: new Vue() // 在全局vm变量中申明Bus
  }
})

<!-- 组件1 -->
this.$root.$emit(eventName, data)

<!-- 组件2 -->
this.$root.$on(eventName, (data) => {
  // todo
})
```

- vuex：状态管理器
  - state: 数据相当于data
  - getters: 计算数学相当于computed
  - mutations: 相当于methods，mutation只能commit state
  - actions: commit mutations，可以异步
  - modules: 分模块，每个模块各自包括state、getters、mutations、actions

```js
const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules
})

<!-- 在组件中调用 -->
couputed: {
  ...mapState({
    doneCount: 'doneTodosCount'
  }),
  ...mapGetters([
    'doneTodosCount',
    'anotherGetter',
    // ...
  ])
}

methods: {
  ...mapMutations([
    'increment', // map `this.increment()` to `this.$store.commit('increment')`

    // `mapMutations` also supports payloads:
    'incrementBy' // map `this.incrementBy(amount)` to `this.$store.commit('incrementBy', amount)`
  ]),
  ...mapMutations({
    add: 'increment' // map `this.add()` to `this.$store.commit('increment')`
  }),
  ...mapActions([
    'increment', // map `this.increment()` to `this.$store.dispatch('increment')`

    // `mapActions` also supports payloads:
    'incrementBy' // map `this.incrementBy(amount)` to `this.$store.dispatch('incrementBy', amount)`
  ]),
  ...mapActions({
    add: 'increment' // map `this.add()` to `this.$store.dispatch('increment')`
  })
}
```
class Watcher {
  constructor(expr, vm, cb) {
    this.$expr = expr;
    this.$vm = vm;
    this.$cb = cb;

    // 获取第一次编译时的值
    this.oldVal = this.getOldVal()
  }
  getOldVal() {
    Dep.target = this;
    const oldVal = compileUtils.getVal(this.$expr, this.$vm)
    Dep.target = null;
    return oldVal
  }
  update() {
    const v = compileUtils.getVal(this.$expr, this.$vm)
    if (v !== this.oldVal) {
      this.$cb(v)
    }
  }
}
class Dep {
  constructor() {
    // 用数组来存放watcher
    this.subs = []
  }
  addSubs(w) {
    this.subs.push(w)
  }
  notify() {
    this.subs.forEach(w => w.update())
  }
}
class Observer {
  constructor(data) {
    this.observe(data)
  }
  observe(data) {
    if (typeof data === 'object' && data !== null) {
      Reflect.ownKeys(data).forEach(key => {
        this.defineReactive(data, key, data[key])
      })
    }
  }
  defineReactive(data, key, value) {
    this.observe(value)
    const dep = new Dep()
    Object.defineProperty(data, key, {
      enumerable: true, // 是否可枚举
      configurable: false, // 是否可被删除
      get() {
        Dep.target && dep.addSubs(Dep.target)
        return value
      },
      set: (newVal) => {
        this.observe(newVal)
        if (newVal !== value) {
          value = newVal
        }
        dep.notify()
      }
    })
  }
}
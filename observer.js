class Watcher {
  constructor(expr, vm, cb) {
    this.expr = expr;
    this.vm = vm;
    this.cb = cb;
    this.oldVal = this.getOldVal();
  }
  getOldVal() {
    Dep.target = this;
    const oldVal = compileUtil.getVal(this.expr, this.vm)
    Dep.target = null;
    return oldVal
  }
  update() {
    const newVal = compileUtil.getVal(this.expr, this.vm);
    if (newVal !== this.oldVal) {
      this.cb(newVal)
    }
  }
}
class Dep {
  constructor() {
    this.subs = []
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  notify() {
    // console.log(this.subs)
    this.subs.forEach(w => w.update())
  }
}
class Observer {
  constructor(data) {
    this.observe(data)
  }
  observe(data) {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'object') {
          this.observe(data[key])
        } else {
          this.defineReactive(data, key, data[key])
        }
      })
    }
  }
  defineReactive(obj, key, value) {
    const dep = new Dep()
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: false,
      get() {
        // 订阅数据变化，添加观察者
        Dep.target && dep.addSub(Dep.target)
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
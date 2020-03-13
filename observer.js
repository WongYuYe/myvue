class Watcher {
  constructor(expr, vm, cb) {
    this.expr = expr;
    this.vm = vm;
    this.cb = cb;
    this.oldVal = this.getOldVal();
    Dep.target = this;
  }
  getOldVal() {
    const oldVal = compileUtil.getVal(this.expr, this.vm)
    // Dep.target = null;
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
    console.log('执行更新')
    console.log(this.subs)
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
        this.defineReactive(data, key, data[key])
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
        dep.addSub(dep.target)
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
// 数据劫持
class Observer {
  constructor(data) {
    this.observe(data);
  }
  observe(data) {
    if (typeof data === "object" && data !== null) {
      Reflect.ownKeys(data).forEach(key => {
        this.defineReactive(data, key, data[key]);
      });
    }
  }
  defineReactive(data, key, value) {
    this.observe(value);
    const dep = new Dep();
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get() {
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set: (newVal) => {
        this.observe(newVal)
        if (newVal !== value) {
          value = newVal;
        }
        dep.notify();
      }
    });
  }
}

// 观察者
class Watcher {
  constructor(expr, vm, cb) {
    this.expr = expr;
    this.vm = vm;
    this.cb = cb;
    this.oldVal = this.getOldVal();
  }
  // 获取初始化的旧值
  getOldVal() {
    Dep.target = this;
    const oldVal = compileUtil.getVal(this.expr, this.vm);
    Dep.target = null
    return oldVal
  }
  // 更新，执行含新值newVal的callback
  update() {
    const newVal = compileUtil.getVal(this.expr, this.vm);
    if (newVal !== this.oldVal) {
      this.cb(newVal);
    }
  }
}

// 依赖收集器
class Dep {
  constructor() {
    this.subs = []; // 初始化空数组存放watcher
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  // 通知watcher更新
  notify() {
    console.log('subs: ' + this.subs)
    this.subs.forEach(w => w.update());
  }
}

// compile方法类
const compileUtil = {
  text(node, expr, vm) {
    let newVal;
    if (expr.includes("{{")) {
      newVal = expr.replace(/\{\{(.+?)\}\}/g, (...match) => {
        new Watcher(match[1].trim(), vm, () => {
          this.updater.textUpdater(node, this.getNewVal(expr, vm));
        });
        return this.getVal(match[1].trim(), vm);
      });
    } else {
      new Watcher(expr, vm, newVal => {
        this.updater.textUpdater(node, newVal);
      });
      newVal = this.getVal(expr, vm);
    }
    this.updater.textUpdater(node, newVal);
  },
  html(node, expr, vm) {
    new Watcher(expr, vm, newVal => {
      this.updater.htmlUpdater(node, newVal);
    });
    let newVal;
    newVal = this.getVal(expr, vm);
    this.updater.htmlUpdater(node, newVal);
  },
  model(node, expr, vm) {
    new Watcher(expr, vm, newVal => {
      this.updater.modelUpdater(node, newVal);
    });
    let newVal;
    newVal = this.getVal(expr, vm);
    this.updater.modelUpdater(node, newVal);
    node.addEventListener(
      "input",
      e => {
        // this.updater.modelUpdater(node, e.target.value);
        this.setVal(expr, vm, e.target.value);
      },
      false
    );
  },
  bind(node, expr, vm, attrName) {
    new Watcher(expr, vm, newVal => {
      this.updater.bindUpdater(node, attrName, newVal);
    });
    let newVal;
    newVal = this.getVal(expr, vm);
    this.updater.bindUpdater(node, attrName, newVal);
  },
  on(node, expr, vm, eventName) {
    const fn = vm.$options.methods && vm.$options.methods[expr];
    node.addEventListener(eventName, fn.bind(vm), false);
  },
  getVal(expr, vm) {
    return expr.split(".").reduce((data, currentVal) => {
      return data[currentVal];
    }, vm.$data);
  },
  getNewVal(expr, vm) {
    return expr.replace(/\{\{(.+?)\}\}/g, (...match) => {
      return this.getVal(match[1].trim(), vm);
    });
  },
  setVal(expr, vm, newVal) {
    expr.split(".").reduce((data, currentVal) => {
      data[currentVal] = newVal;
    }, vm.$data);
  },
  updater: {
    textUpdater(node, textVal) {
      node.textContent = textVal;
    },
    htmlUpdater(node, htmlVal) {
      node.innerHTML = htmlVal;
    },
    modelUpdater(node, modelVal) {
      node.value = modelVal;
    },
    bindUpdater(node, attrName, attrVal) {
      node.setAttribute(attrName, attrVal);
    }
  }
};

// Compile类
class Compile {
  constructor(el, vm) {
    this.$vm = vm;

    this.$el = this.isElementNode(el) ? el : document.querySelector(el);

    // 转化为文档碎片， 防止重绘和回流
    const frag = this.node2Fragment(this.$el);

    // 返回编译过的文档碎片
    const compileFrag = this.compile(frag);

    // 挂载到节点上
    this.$el.appendChild(compileFrag);
  }
  isElementNode(node) {
    return node.nodeType === 1;
  }
  node2Fragment(node) {
    const frag = document.createDocumentFragment();
    let firstChild;
    while ((firstChild = node.firstChild)) {
      frag.appendChild(firstChild);
    }
    return frag;
  }
  // 是否为vue指令
  isVueDirective(attrName) {
    return attrName.startsWith("v-");
  }
  // 是否为事件名
  isEventName(attrName) {
    return attrName.startsWith("@");
  }
  // 编译模板
  compile(frag) {
    [...frag.childNodes].forEach(child => {
      if (child.nodeType === 1) {
        // 元素节点
        this.compileElement(child);
      } else if (child.nodeType === 3) {
        // 文本节点
        this.compileText(child);
      }
      // 递归编译
      if (child.childNodes && child.childNodes.length) {
        this.compile(child);
      }
    });
    return frag;
  }
  // 编译元素节点
  compileElement(node) {
    const attributes = node.attributes;
    [...attributes].forEach(attr => {
      const { name, value } = attr;
      // 判断vue指令如v-text v-model v-html v-on:click v-bind:src
      if (this.isVueDirective(name)) {
        // 拆分属性
        const [, directive] = name.split("-");
        const [dirName, eventName] = directive.split(":");

        compileUtil[dirName](node, value, this.$vm, eventName);
      } else if (this.isEventName(name)) {
        const [, eventName] = name.split("@");

        compileUtil["on"](node, value, this.$vm, eventName);
      }
      // 移除指令属性
      node.removeAttribute(name);
    });
  }
  compileText(node) {
    const reg = /\{\{(.+?)\}\}/g;
    if (reg.test(node.textContent)) {
      compileUtil["text"](node, node.textContent, this.$vm);
    }
  }
}

// Vue类
class Vue {
  constructor(options) {
    this.$options = options;
    this.$el = options.el;
    this.$data = options.data;

    // 当有el时再进行下一步
    if (this.$el) {
      // 数据劫持
      new Observer(this.$data);
      // 编译模板
      new Compile(this.$el, this);

      // 数据代理 this.$data => this
      this.proxyData(this.$data);
    }
  }
  proxyData(data) {
    Reflect.ownKeys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: false,
        get() {
          return data[key];
        },
        set(newVal) {
          if (newVal !== data[key]) {
            data[key] = newVal;
          }
        }
      });
    });
  }
}

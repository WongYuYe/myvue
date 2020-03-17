class Compile {
  constructor(el, vm) {
    this.$vm = vm;

    // 获取节点
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)

    // 节点转化为文档片段，防止重绘和回流
    const frag = this.node2Fragment(this.$el)

    // 编译文档片段
    const compileFrag = this.compile(frag)

    // 挂载到根节点上
    this.$el.appendChild(compileFrag)
  }
  isElementNode(v) {
    return v.nodeType === 1
  }
  isTextNode(v) {
    return v.nodeType === 3
  }
  node2Fragment(node) {
    const frag = document.createDocumentFragment();
    let firstChild;
    while (firstChild = node.firstChild) {
      frag.appendChild(firstChild)
    }
    return frag
  }
  compile(frag) {
    [...frag.childNodes].forEach(childNode => {
      if (this.isElementNode(childNode)) {
        // 元素节点
        this.compileElement(childNode)
      } else if (this.isTextNode(childNode)) {
        // 文本节点
        this.compileText(childNode)
      }
      if (childNode.childNodes && childNode.childNodes.length) {
        this.compile(childNode)
      }
    })
    return frag
  }
  isVueDirective(v) {
    return v.startsWith('v-')
  }
  isVueEventDirective(v) {
    return v.startsWith('@')
  }
  compileElement(node) {
    const { attributes } = node;
    // console.log(attributes);
    [...attributes].forEach(attr => {
      const { name, value } = attr;
      // 判断是否为v指令，如v-text, v-html, v-model, v-bind:src, v-on:click
      if (this.isVueDirective(name)) {
        const [, directive] = name.split('-')
        // 再分割':'
        const [dirName, eventName] = directive.split(':');
        compileUtils[dirName](node, value, this.$vm, eventName)
      } else if (this.isVueEventDirective(name)) {
        // 判断是否为@事件指令，如@click
        const [, eventName] = name.split('@')
        compileUtils['on'](node, value, this.$vm, eventName)
      }
    })
  }
  compileText(node) {
    const reg = /\{\{(.+?)\}\}/g;
    if (reg.test(node.textContent)) {
      compileUtils["text"](node, node.textContent, this.$vm);
    }
  }
}
const compileUtils = {
  text(node, expr, vm) {
    let v;
    if ((/\{\{(.+?)\}\}/g).test(expr)) {
      v = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
        new Watcher(args[1].trim(), vm, () => {
          console.log(this.getNewVal(expr, vm))
          this.updater.textUpdater(node, this.getNewVal(expr, vm))
        })
        return this.getVal(args[1].trim(), vm)
      })
    } else {
      new Watcher(expr, vm, v => {
        this.updater.textUpdater(node, v)
      })
      v = this.getVal(expr, vm)
    }
    this.updater.textUpdater(node, v)
  },
  html(node, expr, vm) {
    new Watcher(expr, vm, v => {
      this.updater.htmlUpdater(node, v)
    })
    this.updater.htmlUpdater(node, this.getVal(expr, vm))
  },
  model(node, expr, vm) {
    new Watcher(expr, vm, v => {
      this.updater.modelUpdater(node, v)
    })
    this.updater.modelUpdater(node, this.getVal(expr, vm))
    node.addEventListener('input', (e) => {
      this.setVal(expr, vm, e.target.value)
    })
  },
  bind(node, expr, vm, attr) {
    new Watcher(expr, vm, v => {
      this.updater.bindUpdater(node, v, attr)
    })
    this.updater.bindUpdater(node, this.getVal(expr, vm), attr)
  },
  on(node, expr, vm, eventName) {
    const fn = vm.$methods && vm.$methods[expr]
    node.addEventListener(eventName, fn.bind(vm), false)
  },
  getVal(expr, vm) {
    return expr.split('.').reduce((data, currentVal) => {
      return data[currentVal]
    }, vm.$data)
  },
  getNewVal(expr, vm) {
    return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getVal(args[1].trim(), vm)
    })
  },
  setVal(expr, vm, v) {
    expr.split('.').reduce((data, currentVal) => {
      data[currentVal] = v
    }, vm.$data)
  },
  updater: {
    textUpdater(node, v) {
      node.textContent = v
    },
    htmlUpdater(node, v) {
      node.innerHTML = v
    },
    modelUpdater(node, v) {
      node.value = v
    },
    bindUpdater(node, v, attr) {
      node.setAttribute(attr, v)
    }
  }
}
class Vue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    this.$methods = options.methods;
    this.$options = options;

    if (this.$el) {
      // 数据劫持
      new Observer(this.$data)
      // 编译模板
      new Compile(this.$el, this)

      // 代理数据
      this.proxyData(this.$data)
    }
  }
  proxyData(data) {
    if (typeof data === 'object' && data !== null) {
      Reflect.ownKeys(data).forEach(key => {
        Object.defineProperty(this, key, {
          enumerable: true,
          configurable: false,
          get() {
            return data[key]
          },
          set(newVal) {
            if (newVal !== data[key]) {
              data[key] = newVal
            }
          }
        })
      })
    }
  }
}
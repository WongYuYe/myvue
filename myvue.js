class MVue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    // this.$methods = options.$methods;
    this.$options = options;

    if (this.$el) {
      // 实现一个数据观察者observer
      new Observer(this.$data)
      // 实现一个指令编译器compile
      new Compile(this.$el, this);

      // 实现一个数据监听器watcher
    }
  }
}

const compileUtil = {
  getVal(expr, vm) {
    return expr.split('.').reduce((data, currentVal) => {
      return data[currentVal]
    }, vm.$data)
  },
  text(node, expr, vm) {
    let text;
    // 判断格式是否为{{}}或者v-text
    if(expr.includes('{{')) {
      // expr为{{person.name}}--{{person.age}} {{person.name}}
      text = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
        // args: [ "{{person.name}}", "person.name", 0, "{{person.name}}--{{person.age}}" ]，取args[1]
        return this.getVal(args[1], vm)
      })
    } else {
      text = this.getVal(expr, vm);
    }
    this.updater.textUpdater(node, text);
  },
  html(node, expr, vm) {
    new Watcher(expr, vm, (newVal) => {
      this.updater.htmlUpdater(node, newVal);
    })
    const html = this.getVal(expr, vm);
    this.updater.htmlUpdater(node, html);
  },
  model(node, expr, vm) {
    const value = this.getVal(expr, vm);
    if (node.nodeName === 'INPUT') {
      this.updater.modelUpdater(node, value)
    }
  },
  bind(node, expr, vm, attrName) {
    const attr = this.getVal(expr, vm);
    this.updater.bindUpdater(node, attrName, attr)
  },
  on(node, expr, vm, eventName) {
    const fn = vm.$options.methods && vm.$options.methods[expr] 
    node.addEventListener(eventName, fn.bind(vm), false)
  },
  updater: {
    textUpdater(node, value) {
      node.textContent = value;
    },
    htmlUpdater(node, value) {
      node.innerHTML = value;
    },
    modelUpdater(node, value) {
      node.value = value;
    },
    bindUpdater(node, attrName, attrVlaue) {
      node.setAttribute(attrName, attrVlaue)
    }
  }
};

class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    // 1.转化为文档碎片，减少页面回流和重绘
    const frag = this.node2Fragment(this.el);

    // 2.编译
    const compileFrag = this.compile(frag);

    // 3.挂载
    this.el.appendChild(compileFrag);
  }
  compile(frag) {
    [...frag.childNodes].forEach(child => {
      if (child.nodeType === 1) {
        // 编译元素节点
        this.compileElement(child);
      } else if (child.nodeType === 3) {
        // 编译文本节点
        this.compileText(child);
      }
      if (child.childNodes && child.childNodes.length) {
        this.compile(child);
      }
    });
    return frag;
  }
  compileElement(node) {
    // 获取属性
    const attributes = node.attributes;
    [...attributes].forEach(attr => {
      const { nodeName, value } = attr;
      // 是否指令 v-html v-text v-model v-on:click v-bind:src
      if (this.isDirective(nodeName)) {
        const [, directive] = nodeName.split("-");
        const [dirName, eventName] = directive.split(":");

        // 编译数据，数据驱动视图
        compileUtil[dirName](node, value, this.vm, eventName);

        // 删除指令
        node.removeAttribute(`v-${directive}`)
      } else if (this.isEventName(nodeName)) {
        const [,eventName] = nodeName.split('@')
        // 编译数据，数据驱动视图
        compileUtil['on'](node, value, this.vm, eventName);
      }
    });
    // node.attributes['v-text']
  }
  isDirective(nodeName) {
    return nodeName.startsWith('v-')
  }
  isEventName(nodeName) {
    return nodeName.startsWith('@')
  }
  compileText(node) {
    const regexp = /\{{2}(.+)\}{2}/g;
    if(regexp.test(node.textContent)) {
      compileUtil['text'](node, node.textContent, this.vm)
    }
  }
  node2Fragment(el) {
    // 创建文档碎片
    let frag = document.createDocumentFragment();
    let firstChild;
    while ((firstChild = el.firstChild)) {
      // fragment的appendChild移动dom
      frag.appendChild(firstChild);
    }
    return frag;
  }
  isElementNode(node) {
    return node.nodeType === 1;
  }
}

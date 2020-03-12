class MVue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    this.$options = options;

    if (this.$el) {
      // 实现一个数据观察者observer

      // 实现一个指令编译器compile
      new Compile(this.$el, this);

      // 实现一个数据监听器watcher
    }
  }
}

const compileUtil = {
  text(value, vm) {
    node.innerText = vm.$data[value]
  },
  html(value, vm) {
    node.innerHTML = vm.$data[value]
  },
  model() {},
  on() {}
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
        console.log("元素节点", child);
        // 编译元素节点
        this.compileElement(child);
      } else if (child.nodeType === 3) {
        // console.log('文本节点', child)
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
      // 是否指令 html text model on
      if (this.isDirective(attr)) {
        const [, directive] = nodeName.split("-");
        const [dirName, eventName] = directive.split(":");
        this.compileUtil[directive](dirName, value, this.vm, eventName);
      }
      // if (attr.nodeName === 'v-text') {
      //   node.innerText = this.vm.$data[attr.nodeValue]
      // } else if (attr.nodeName === 'v-html') {
      //   node.innerHTML = this.vm.$data[attr.nodeValue]
      // } else if (attr.nodeName === 'v-model' && node.nodeName === 'INPUT') {
      //   node.value = this.vm.$data[attr.nodeValue]
      // }
    });
    // node.attributes['v-text']
  }
  isDirective(attr) {
    
  }
  compileText(node) {
    const regexp = /\{{2}\s+\}{2}/g;
    // node.nodeValue
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

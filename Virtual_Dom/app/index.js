function dom(type, props, ...children) {
  return {
    type,
    props,
    children
  }
}
const profile = (
  <div id="profile" data-uers-id = "1">
    <p>Tom</p>
  </div>
)

function generateDom(domObj) {
  let $el;
  if (domObj.type) {
    $el = document.createElement(domObj.type)
  } else {
    $el = document.createTextNode(domObj)
  }

  if (domObj.props) {
    Reflect.ownKeys(domObj.props).forEach(prop => {
      $el.setAttribute(prop, domObj.props[prop])
    })
  }

  if (domObj.children && domObj.children.length) {
    domObj.children.forEach(child => {
      $el.appendChild(generateDom(child))
    })
  }
  return $el;
}

function isTypeChanged(domObj1, domObj2) {
  if (domObj1.type !== undefined && domObj2.type !== undefined) {
    return domObj1.type !== domObj2.type
  }
  return domObj1 !== domObj2
}

const types = {
  get: type => Object.prototype.toString.call(type),
  number: '[object Number]',
  String: '[object String]',
  Undefined: '[object Undefined]',
  Boolean: '[object Boolean]',
  Object: '[object Object]',
  Array: '[object Array]',
  Function: '[object Function]',
  Null: '[object Null]',
}

function vDom($parent, oldNode, newNode, index = 0) {
  const $currentNode = $parent.childNodes[index];
  if (!oldNode) {
    // append
    return $parent.appendChild(generateDom(newNode))
  }
  if (!newNode) {
    // remove
    return $parent.removeChild($parent.childNodes[index])
  }
  if (isTypeChanged(oldNode, newNode)) {
    return $parent.replaceChild(generateDom(newNode), $currentNode)
  }
  if (oldNode === newNode) {
    return
  }
  // props更新
  const oldProps = oldNode.props
  const newProps = newNode.props
  if (isObjectChanged(oldProps, newProps)) {
    const oldPropsKeys = Reflect.ownKeys(oldProps) || [];
    const newPropsKeys = Reflect.ownKeys(newProps) || [];

    if (newPropsKeys.length === 0) {
      oldPropsKeys.forEach(prop => {
        $currentNode.removeAttribute(prop)
      })
    } else {
      const allProps = [...new Set([...oldPropsKeys, ...newPropsKeys])];
      allProps.forEach(prop => {
        if (oldProps[prop] === undefined) {
          // set
          $currentNode.setAttribute(prop, newProps[prop])
        } else if (newProps[prop] === undefined) {
          // remove
          $currentNode.removeAttribute(prop)
        } else if (newProps[prop] !== oldProps[prop]){
          $currentNode.setAttribute(prop, newProps[prop])
        }

      })

    }

  }
  if ((oldNode.children && oldNode.children.length) || (newNode.children && newNode.children.length)) {
    const max = Math.max(oldNode.children.length, newNode.children.length)
    for(let i = 0; i < max; i ++) {
      vDom($currentNode, oldNode.children[i], newNode.children[i], i)
    }
  }

  
}

function isObjectChanged(obj1, obj2) {
  // 判断数据类型是否一致
  if (types.get(obj1) !== types.get(obj2)) {
    return true
  }

  // 深入判断
  if (types.get(obj1) === types.Object) {
    const obj1Keys = Object.keys(obj1)
    const obj2Keys = Object.keys(obj2)

    if (obj1Keys.length !== obj2Keys.length) {
      return true;
    }

    if (obj1Keys.length === 0) {
      return false
    }

    obj1Keys.forEach(key => {
      if(obj1[key] !== obj2[key]) {
        return true;
      }
    })
    for(let i = 0; i < obj1Keys.length; i ++) {
      let key = obj1Keys[i]
      if(obj1[key] !== obj2[key]) {
        return true;
      }
    }
  }
  return false;
}

const app = document.querySelector('#app');
const previous = null;
let current = (
  <div class='ha'>
    <p class='hi' data-msg='小苏'>嘿嘿</p>
  </div>
)
// console.log(current)
vDom(app, previous, current)
const sec = (
  <div class='ha'>
    <p class='hi' data-msg='小野' data-name='小本苏'>诶诶</p>
  </div>
)
setTimeout(() => {
  vDom(app, current, sec)
}, 1000)
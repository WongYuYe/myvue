### Virtual Dom
#### 环境搭建：
##### 1. clone [webpack-boilerplate](https://github.com/cvgellhorn/webpack-boilerplate)
##### 2. npm install
##### 3. npm install --save-dev @babel/plugin-transform-react-jsx
##### 4. .babelrc配置
```
"plugins": [
  [
    "@babel/plugin-transform-react-jsx",
    {
      "pragma": "dom" // 默认转换的方法名，可自行更换
    }
  ]
]
```
#### [代码演示](./app/index.js)
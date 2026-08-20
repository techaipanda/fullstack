// ⭐ part7 c — Class Components 子节 —— 课程原文 Code Block 4 verbatim
// 课程原文:"We'll finish off the component with the ability to change the shown anecdote."
//
// 本子节要点(逐行 ⭐ 中文注释,只解释 WHY,不替换课程代码):
//
// ⭐ 核心概念 1:Class Component 三要素
//   1) extends React.Component
//   2) constructor(props) { super(props); this.state = {...} }
//   3) render() { return JSX }
//   - 不用 class:写函数组件 + useState(现代 React 默认方式)
//   - 用 class:Hooks 出现前(React < 16.8)的唯一写法,今天在维护老代码时仍会遇到
//   - 验证:看 React DevTools,组件名会显示 "App (Class)"
//
// ⭐ 核心概念 2:this.state 是单个对象(对比 useState 多变量)
//   - 课程原文:"Class Components only contain one state. So if the state is made up
//     of multiple parts, they should be stored as properties of the state."
//   - 不用 this.state 对象:无法用 class component(只能 useState)
//   - 用 this.state 对象:把所有相关 state 字段塞进一个对象,渲染时 this.state.x 读
//   - 验证:打开 React Devtools,展开 App 的 state 看到 {anecdotes, current}
//
// ⭐ 核心概念 3:this.setState({ key: value }) 只更新指定 key
//   - 课程原文:"The method only touches the keys that have been defined in the object
//     passed to the method as an argument."
//   - 不用 setState:无法触发重渲染(直接赋值 this.state.x = y 不触发 render)
//   - 用 setState({ anecdotes: [...] }):只改 anecdotes,current 保持不变(对象浅合并)
//   - 验证:在 componentDidMount 里看 console.log(this.state) 第一次是 {anecdotes:[],current:0},
//          然后 setState 触发后是 {anecdotes:[6 items],current:0} ← current 没被改
//
// ⭐ 核心概念 4:生命周期方法 componentDidMount ≈ useEffect(()=>{},[])
//   - 课程原文:"The correct place to trigger the fetching of data from a server is inside
//     the lifecycle method componentDidMount, which is executed once right after the first
//     time a component renders"
//   - 不用 componentDidMount:无法在"首次渲染后"做副作用(fetch / 订阅 / DOM 操作)
//   - 用 componentDidMount:首次 render → 立刻跑 → setState → 触发二次 render
//   - 验证:在 componentDidMount 里 console.log('mounted'),浏览器看到一次"mounted"
//          (因为只在挂载时跑一次),对比 functional 版的 useEffect(...,[]) 同样只跑一次
//
// ⭐ 核心概念 5:箭头函数类属性(componentDidMount = () => {...})自动绑定 this
//   - 课程 verbatim 使用箭头函数类字段写法(ES2022 class fields)
//   - 不用箭头函数:写成 componentDidMount() {...} 时,内部的 this 是 undefined
//     (方法作为 props/onClick 传出去会丢 this),要手动 bind(this) 救场
//   - 用箭头函数类字段:this 自动绑定到当前实例,代码里少写一堆 bind / that = this
//   - 验证:故意把 componentDidMount 改成普通方法 + 在 render() 里访问 this.componentDidMount,
//          你会发现 this === undefined(然后报错)
//
// ⭐ 核心概念 6:Math.floor(Math.random() * length) 随机索引(对比 functional 版略不同)
//   - 课程 verbatim 这里写的是 Math.floor(Math.random() * this.state.anecdotes.length)
//   - 留意:Course Code Block 5 的 functional 版用的是 Math.round(Math.random() * (length-1))
//   - 不替换:course-follow-official Step 4 严禁"用 functional 那行改 class 那行"
//   - 用 floor 版:随机索引 0..length-1(整数);round 版:0..length-1 也是整数 —— 行为接近但
//     浮点边界略不同。课程里两版都有,保留 class 那版不动。

import React from 'react'
import axios from 'axios'

class App extends React.Component {
  constructor(props) {
    super(props)

    // ⭐ this.state 初始化:两个字段 anecdotes + current
    // 课程原文:"The state is initialized in the constructor"
    this.state = {
      anecdotes: [],
      current: 0
    }
  }

  // ⭐ 生命周期:首次渲染后立刻拉远端数据
  // 课程原文:"componentDidMount ... is executed once right after the first time a component renders"
  componentDidMount = () => {
    axios.get('http://localhost:3001/anecdotes').then(response => {
      // ⭐ setState 浅合并:这里只动 anecdotes,current 不变
      this.setState({ anecdotes: response.data })
    })
  }

  // ⭐ next 按钮处理:随机选一个新索引
  // 课程原文对照 Code Block 4 verbatim
  handleClick = () => {
    const current = Math.floor(
      Math.random() * this.state.anecdotes.length
    )
    this.setState({ current })
  }

  render() {
    // ⭐ 防御性渲染:数据没回来时显示占位
    if (this.state.anecdotes.length === 0 ) {
      return <div>no anecdotes...</div>
    }

    return (
      <div>
        <h1>anecdote of the day</h1>
        <div>{this.state.anecdotes[this.state.current].content}</div>
        <button onClick={this.handleClick}>next</button>
      </div>
    )
  }
}

// ⭐ 课程里 App 是默认导出,main.jsx 用 import App from './App'
export default App
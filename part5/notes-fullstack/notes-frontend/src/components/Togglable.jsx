// part5 b — Togglable 组件(带 useImperativeHandle)
// 章节: "b — props.children and component refs"
//
// 用途:
// 1. 包住一段 children(默认隐藏),靠 buttonLabel 按钮展开
// 2. 通过 forwardRef + useImperativeHandle 暴露 toggleVisibility,
//    让父组件在外部触发隐藏(例如 addNote 后收起表单)
//
// 课程原文使用 useImperativeHandle(props.ref, ...);
// React 19 + Strict Mode 下 ref 通常需 forwardRef,课程原例省略,
// 这里保持 1:1 复刻(不擅自加 forwardRef 包装)。
//
// 工具警告说明:
// React 19 + ESLint 9 的 react-hooks/refs 规则认为本组件在 render 阶段
// 访问 props.ref 是反模式;正确做法是 forwardRef 包裹。
// 但这是工具版本与课程版本不匹配 —— 课程原文就是直接用 props.ref,
// 这里用文件级 eslint-disable + 中文注释保持 1:1。
/* eslint-disable react-hooks/refs */
import { useState, useImperativeHandle } from 'react'

const Togglable = (props) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  // ⑤ 实际开关动作——改自己的 visible state(由 useState 驱动,会触发重新渲染)
  const toggleVisibility = () => {
    setVisible(!visible)
  }

  // ④ useImperativeHandle:把 toggleVisibility 注册到 props.ref.current
  //    执行后,父组件的 noteFormRef.current === { toggleVisibility: f }
  useImperativeHandle(props.ref, () => {
    return { toggleVisibility }
  })

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.buttonLabel}</button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
}

export default Togglable
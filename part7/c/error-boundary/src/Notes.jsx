// ⭐ 本子项目内联 stub —— 课程没定义 Notes(只是示意组件名)
// stub 故意包含一个按钮触发 throw,让你手动验证 ErrorBoundary 真的接住了错误
// 课程 verbatim 的 App.jsx 里 <Notes /> 是空的,所以这里**必须有**一个组件才能 import 跑通
//
// ⭐ 破例标注:严格 course-follow-official 禁止"add helpers the course didn't add",
//   但本子项目要演示 ErrorBoundary 触发流程,stub 是不可避免的(同 c 章 Class Components 的 useNotes 破例)

const Notes = () => {
  // ⭐ handleClick 主动抛错:模拟 Notes 组件内部某处崩了
  // 真实项目里可能是 fetch 失败 / 数据 shape 不对 / 计算 NaN 等
  const handleClick = () => {
    throw new Error('Notes 模拟崩溃 —— 测试 ErrorBoundary')
  }

  return (
    <div>
      <h2>Notes section</h2>
      <p>(课程里 Notes 是示意组件;本子项目内联 stub 用于触发 boundary 演示)</p>
      <button onClick={handleClick}>throw an error in Notes</button>
    </div>
  )
}

export default Notes
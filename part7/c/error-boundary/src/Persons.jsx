// ⭐ 本子项目内联 stub —— 课程没定义 Persons
// 同 Notes 的破例理由;故意包含一个按钮触发 throw,
// 验证 ErrorBoundary 兄弟隔离特性:Notes 挂的时候 Persons 仍然正常

const Persons = () => {
  const handleClick = () => {
    throw new Error('Persons 模拟崩溃 —— 测试 ErrorBoundary')
  }

  return (
    <div>
      <h2>Persons section</h2>
      <p>(课程里 Persons 是示意组件;本子项目内联 stub 用于触发 boundary 演示)</p>
      <button onClick={handleClick}>throw an error in Persons</button>
    </div>
  )
}

export default Persons
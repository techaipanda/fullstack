// ⭐⭐⭐ Notify.jsx — part8w "User login" 沿用 part8p verbatim ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 沿用 part8p Notify.jsx**
//   课程 Chapter 5 "User login" 小节**未给 Notify.jsx**(per course block 0-13
//   都没提 Notify)
//   但是 App.jsx block 7 引用了 `<Notify errorMessage={errorMessage} />`
//   App.jsx block 12 又用了一次
//   → 本节**沿用 part8p** 的 Notify(verbatim),因为:
//     1. Notify 是 part8p 已经建立的"标准错误展示组件"
//     2. Notify 极简(8 行),不属于"占位组件",是真有功能的展示组件
//     3. User 选择"全部 stub 占位"指 Persons/PersonForm/PhoneForm,
//        Notify 不在这个列表里
//
// ⭐ 跟 part8p 的**唯一**差异:文件顶部注释里点名 part8w 而非 part8p
//
// ⭐⭐⭐ Notify 组件 — verbatim 课程 part8p line 436-447 ⭐⭐⭐
const Notify = ({ errorMessage }) => {
  // ⭐⭐ 核心:无错误时 return null(per course line 437-439)⭐⭐
  if (!errorMessage) {
    return null
  }

  // ⭐⭐⭐ 红字 div(per course line 441-443)⭐⭐⭐
  return (
    <div style={{ color: 'red' }}>
      {errorMessage}
    </div>
  )
}

// ⭐ 课程 verbatim — default export,让 App.jsx 能 import Notify
export default Notify
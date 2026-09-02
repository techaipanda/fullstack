// ⭐⭐⭐ Persons.jsx — part8w STUB(占位组件,非课程原文)⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**不是**课程原文
//   - 课程 Chapter 5 "User login" 小节**未给 Persons.jsx 内容**(block 7 / 12 直接 import 它)
//   - Persons 完整内容(per part8l "Making queries")包含 useQuery(ALL_PERSONS) + useState + Person 子组件 +
//     show address 按钮等,属于 Chapter 5 **之前**的"Listing persons"小节
//   - 该小节我们还没做
//   - 用户选择:"全部 stub 占位(只渲染字面 'Persons/PersonForm/PhoneForm here')"
//   - 所以本文件 = 纯占位组件,只渲染字面文本 "Persons here"
//
// ⭐ 跟 part8p 的差异:
//   part8p:Persons 完整版 — useState + useQuery(FIND_PERSON, { skip }) + 列表 + show address 按钮
//   part8w:Persons stub  — 只接受 persons prop(per course block 12 `persons={result.data.allPersons}`),
//                       渲染字面 "Persons here"
//
// ⭐ 为什么 stub 还要接受 persons prop?
//   - App.jsx block 12 verbatim 写 `<Persons persons={result.data.allPersons} />`
//   - 如果 Persons 不接 prop,ESLint 会报 unused-vars warning(per part8p 沿用约定)
//   - 接 prop 但不使用,故意保留 prop 接收让 App.jsx verbatim 不报错
//
// ⭐ 下一步(per course 顺序):
//   - Chapter 5 "Listing persons"小节(part8x,待映射字母)会把本 stub 替换为完整版
//   - 替换时:加 useState + useQuery(FIND_PERSON, { skip }) + 列表渲染 + Person 子组件

const Persons = ({ persons }) => {
  // ⭐ 故意不渲染 persons prop(它是 stub)— 只渲染字面占位文本
  return (
    <div>
      Persons here
    </div>
  )
}

export default Persons
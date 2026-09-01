// ⭐⭐⭐ PersonForm.jsx — part8w STUB(占位组件,非课程原文)⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**不是**课程原文
//   - 课程 Chapter 5 "User login" 小节**未给 PersonForm.jsx 内容**(block 12 直接 import 它)
//   - PersonForm 完整内容(per part8n "Doing mutations")包含 4 个 useState +
//     CREATE_PERSON mutation + submit handler + event.preventDefault
//   - 用户选择:"全部 stub 占位(只渲染字面 'Persons/PersonForm/PhoneForm here')"
//   - 所以本文件 = 纯占位组件,只渲染字面文本 "PersonForm here"
//
// ⭐ 跟 part8p 的差异:
//   part8p:PersonForm 完整版 — 4 个 useState + useMutation(CREATE_PERSON, { refetchQueries, onError }) + form JSX
//   part8w:PersonForm stub  — 只接受 setError prop(per course block 12 `setError={notify}`),
//                          渲染字面 "PersonForm here"
//
// ⭐ 为什么 stub 还要接受 setError prop?
//   - App.jsx block 12 verbatim 写 `<PersonForm setError={notify} />`
//   - 接收 prop 让 App.jsx verbatim 不报 unused prop 错误
//
// ⭐ 下一步(per course 顺序):
//   - Chapter 5 "Doing mutations"小节会替换本 stub
//   - 替换时:加 4 个 useState + useMutation(CREATE_PERSON, { refetchQueries, onError }) + form JSX

const PersonForm = ({ setError }) => {
  return (
    <div>
      PersonForm here
    </div>
  )
}

export default PersonForm
// ⭐⭐⭐ PhoneForm.jsx — part8w STUB(占位组件,非课程原文)⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**不是**课程原文
//   - 课程 Chapter 5 "User login" 小节**未给 PhoneForm.jsx 内容**(block 12 直接 import 它)
//   - PhoneForm 完整内容(per part8q "Updating a phone number")包含 2 个 useState +
//     EDIT_NUMBER mutation + submit handler + onCompleted 处理 success-but-null
//   - 用户选择:"全部 stub 占位(只渲染字面 'Persons/PersonForm/PhoneForm here')"
//   - 所以本文件 = 纯占位组件,只渲染字面文本 "PhoneForm here"
//
// ⭐ 跟 part8q 的差异:
//   part8q:PhoneForm 完整版 — 2 个 useState + useMutation(EDIT_NUMBER, { onCompleted }) + form JSX
//   part8w:PhoneForm stub  — 只接受 setError prop(per course block 12 `setError={notify}`),
//                         渲染字面 "PhoneForm here"
//
// ⭐ 为什么 stub 还要接受 setError prop?
//   - App.jsx block 12 verbatim 写 `<PhoneForm setError={notify} />`
//   - 接收 prop 让 App.jsx verbatim 不报 unused prop 错误
//
// ⭐ 下一步(per course 顺序):
//   - Chapter 5 "Doing mutations"小节会替换本 stub
//   - 替换时:加 2 个 useState + useMutation(EDIT_NUMBER, { onCompleted }) + form JSX

const PhoneForm = ({ setError }) => {
  return (
    <div>
      PhoneForm here
    </div>
  )
}

export default PhoneForm
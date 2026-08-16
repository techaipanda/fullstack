// ===== part6a — ### Uncontrolled form(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#uncontrolled-form
// 课程原文 verbatim:part6a.md L598-L671 — 引入 uncontrolled form + addNote handler。
//
// 课程叙事弧:
//   L539-L596 已经让 store 拥有 `actions.add`(基于 concat 的不可变更新),
//   L598-L671 这一节把 add 接到 UI:在 App 里加一个 `<form>`,提交时调用 add。
//   课程 L640 强调:"unlike previous React-implemented forms, we have not
//   bound the form field's value to the state of the App component" — 这是
//   uncontrolled form 的关键特征(input 不受 React state 控制)。
//
// verbatim 1:1 对照(L602-L637):
//   import { useNotes, useNoteActions } from './store'
//
//   const App = () => {
//     const notes = useNotes()
//     const { add } = useNoteActions()
//
//     const generateId = () => Number((Math.random() * 1000000).toFixed(0))
//
//     const addNote = (e) => {
//       e.preventDefault()
//       const content = e.target.note.value
//       add({ id: generateId(), content, important: false })
//       e.target.reset()
//     }
//
//     return (
//       <div>
//         <form onSubmit={addNote}>
//           <input name="note" />
//           <button type="submit">add</button>
//         </form>
//         <ul>
//           {notes.map(note => (
//             <li key={note.id}>
//               {note.important ? <strong>{note.content}</strong> : note.content}
//             </li>
//           ))}
//         </ul>
//       </div>
//     )
//   }
//
// 课程关键设计点:
//   1. (L607) `const { add } = useNoteActions()` — destructure 出 add 函数。
//      上节(L566-L582)已经把 actions 收进子对象,这里一行 destructure 就拿到。
//   2. (L609) `generateId` 用 `Math.random() * 1000000` 然后 `toFixed(0)` 截断。
//      课程原话是演示用,不是 production-ready id 方案(part5 notes 用的是
//      `Math.max(...notes.map(n=>n.id),0)+1`,Zustand 这里为了简洁用 random)。
//      这是 verbatim 1:1 保留 — 不替课程做选择。
//   3. (L613-L617) `addNote` 4 步:
//        e.preventDefault()    — 阻止 form 默认提交行为(整页刷新)
//        e.target.note.value  — 读 input 值(name="note" 是关键)
//        add({id, content, important:false}) — 默认新建 note 都是非 important
//        e.target.reset()      — 清空 form(让用户可以连续输入)
//   4. (L623-L626) form 标签上加 `name="note"`,这是 handler 用 `e.target.note.value`
//      访问值的前提。课程 L654 强调:"the input field has a name"。
//   5. (L640-L643) uncontrolled form 的代价 — 不能做实时验证、不能根据 input
//      值 disable submit。但本节够用,课程不展开。
//
// 课程 L671:"The current code of the application is available in its entirety
// on GitHub, in the branch part6-1" — 整个 L492-L671 范围对应 `part6-1` 分支。
// 下一节 L673+ "More components and functionality" 才把 form/list/note 拆成
// 独立子组件,本节所有逻辑都还在 App.jsx 里。

import { useNotes, useNoteActions } from './store'

const App = () => {
  const notes = useNotes()
  const { add } = useNoteActions() // highlight-line

  const generateId = () => Number((Math.random() * 1000000).toFixed(0))  // highlight-line

 // highlight-start
  const addNote = (e) => {
    e.preventDefault()
    const content = e.target.note.value
    add({ id: generateId(), content, important: false })
    e.target.reset()
  }
   // highlight-end

  return (
    <div>
      <form onSubmit={addNote}>
        <input name="note" />
        <button type="submit">add</button>
      </form>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            {note.important ? <strong>{note.content}</strong> : note.content}
          </li>
        ))}
      </ul>
    </div>
  )
}

// 课程 part6a.md L602-L637 verbatim 漏写了 `export default App`(笔误),
// 上一节 L498-L516 是有 export default 的;GitHub part6-1 分支应有此行。
// main.jsx 的 `import App from './App'` 需要 default export 才能 import 成功。
// 这里补回,严格保留 verbatim 逻辑(仅添加缺失的 export 行)。
export default App
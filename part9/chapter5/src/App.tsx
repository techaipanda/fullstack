// part5 g — React app with state
//
// 课程原文 (line 573-796) 把前面"静态数据"升级成"带状态的 note app"。
// 最终版本 (line 757-794) "our app is ready and perfectly typed!" — 1:1 复刻。
//
// 章节关键路径(随课程推进演示了 4 个 step):
//   step 1: useState('') vs useState([]) 推断差异           (line 580-628)
//   step 2: 用 type parameter useState<Note[]>([]) 显式声明 (line 632-654)
//   step 3: 表单 onChange + event.target.value              (line 686-718)
//   step 4: 表单 onSubmit + React.SyntheticEvent handler    (line 720-794)
//
// 4 个 step 在课程里分4 个代码块;最终版的 App.tsx 是 step 4 的"成品"。
// 之前的 3 种 Welcome 写法(sub-section 2 已迁到 src/Welcome.tsx 留作历史)。
//
// ⚠️ React 19 / React.SyntheticEvent 仍然兼容 — React 19 文档把 SyntheticEvent
//   从 React 命名空间保留,所以 `React.SyntheticEvent` 类型不需额外 import 修复。

import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// Note interface — 课程 line 758-761 verbatim
// ─────────────────────────────────────────────────────────────────────────
interface Note {
  id: string,
  content: string
}

// ─────────────────────────────────────────────────────────────────────────
// App 组件 — 课程 line 763-793 verbatim(最终态)
//
// 关键代码段(课程逐段演示,最终合并):
//   - useState<Note[]>([]) 显式 type parameter
//     课程 line 666-669: const [notes, setNotes] = useState<Note[]>([...])
//   - useState('') TS 推断为 string
//     课程 line 583: const [newNote, setNewNote] = useState('')
//   - 表单 onChange 处理: setNewNote(event.target.value)
//     课程 line 782-784
//   - 表单 onSubmit 处理: React.SyntheticEvent → preventDefault + setNotes.concat
//     课程 line 768-777
//
// ⭐ 核心概念 1: useState 的类型推断 + 泛型 type parameter
//  useState 是 generic function: function useState<S>(initial: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
//   推 断: useState('')  →  TS 从 '' 推断出 S = string,无需手动标注
//   推不出: useState([]) →  TS 看到 [] 推断出 never[],但不知道元素类型
//                          编译期安全但运行时无用 → 必须显式 useState<Note[]>([])
//   验证: 把 useState<Note[]> 改成 useState([]),hover notes 看 never[]
//   关联: 课程原文 line 594-654 "useState is a generic function"
//
// ⭐ 核心概念 2: React.SyntheticEvent
//  React 把原生 DOM 事件包装成 SyntheticEvent(虚拟事件),跨浏览器一致
//   隐式 any 问题: const handler = (event) => ... → ESLint "implicit any"
//                  event 没有类型,event.preventDefault() 等操作不通过类型检查
//   解 决:  标注 event: React.SyntheticEvent → IDE 弹出 preventDefault/stopPropagation 等方法
//   注: 课程 line 753 引用的 cheatsheet 现在推荐用更窄的类型
//       (React.FormEvent<HTMLFormElement> 等) — 课程用的是最宽泛的 SyntheticEvent
//   验证: hover 在 event 上看 React.SyntheticEvent 类型;不标注看 implicit any 报错
//   关联: 课程原文 line 748-754 "implicit any" / "React.SyntheticEvent"
//
// ⭐ 核心概念 3: setNotes(notes.concat(noteToAdd)) 不可变更新
//  为什么用 concat / [...notes, x] 而不是 notes.push(x)
//    - React 假设 state 是 immutable 的;push 会原地修改原数组,React 不会触发 re-render
//    - concat / spread 返回新数组,引用变化,React 检测到 state 变化,触发重渲染
//  验证: 把 .concat 改成 .push,提交后页面笔记数量不变
//  关联: 课程原文 line 774 setNotes(notes.concat(noteToAdd));
// ─────────────────────────────────────────────────────────────────────────
const App = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');

  // highlight-start
  const noteCreation = (event: React.SyntheticEvent) => {
    event.preventDefault()
    const noteToAdd = {
      content: newNote,
      id: String(notes.length + 1)
    }
    setNotes(notes.concat(noteToAdd));

    setNewNote('')
  };
  // highlight-end

  return (
    <div>
      <form onSubmit={noteCreation}>
        <input value={newNote} onChange={(event) => setNewNote(event.target.value)} />
        <button type='submit'>add</button>
      </form>
      <ul>
        {notes.map(note =>
          <li key={note.id}>{note.content}</li>
        )}
      </ul>
    </div>
  )
}

export default App;
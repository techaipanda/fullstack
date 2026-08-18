// ===== part6c — useNotes custom hook =====
// 课程章节: https://fullstackopen.com/en/part6/react_query_context_api#useNotes-custom-hook
// 课程原文 verbatim: part6c 第 4 个 H2 整段(本节无 H3 子段)。
//
// 本节做了什么:
//   - 新增 src/hooks/useNotes.js(verbatim 1:1 对照课程 §2 代码块)
//   - App.jsx 不再 import useQuery / useMutation / useQueryClient
//     — TanStack Query 的所有细节全在 hook 内部,App 只消费 hook 返回值
//   - 解构 hook 返回值: { notes, isPending, addNote: addNoteToServer, toggleImportance }
//     注意 rename:addNote 在 hook 里吃 string(content),在 App 里改名 addNoteToServer
//     以避免与 form onSubmit 的本地 addNote 包装函数同名
//   - <li> 上不再有 onClick(本节清掉;part6-3 时已经修过 button onClick 传 note 而非 note.id,
//     既然 button 自己触发 toggleImportance,li onClick 就是冗余)
//
// verbatim 1:1 对照(从课程 §3 代码块抽取):
//   - hook 调用形态: const { notes, isPending, addNote: addNoteToServer, toggleImportance } = useNotes()
//   - 本地 addNote 函数保留: event.preventDefault + 取 note.value + reset + addNoteToServer(content)
//   - loading 分支: if (isPending) return <div>loading data...</div>
//   - 列表渲染: notes.map(note => <li key={note.id}> ... <button onClick={() => toggleImportance(note)}> ... </button> </li>)
//
// 课程说明(本节首段,抽 hook 的动机):
// "Our solution is fairly good, but somewhat bothersome is the fact that many
//  TanStack Query implementation details have been placed directly inside the
//  React component. Let's extract these into their own custom hook function."
//
// 课程原话末段:"The code for the application is in GitHub in the branch _part6-3_."
// — 注意:part6-3 branch 实际上包含本课程 part6c 中三节的代码 state:
//    1) Optimizing the performance(setQueryData + refetchOnWindowFocus)
//    2) 本节(useNotes custom hook)
//    下一节直接进 "Exercises 6.16-6.19"(anecdotes 题),不再有 part6-4+ 新分支。

import { useNotes } from './hooks/useNotes'

const App = () => {
  const { notes, isPending, addNote: addNoteToServer, toggleImportance } = useNotes()

  const addNote = async (event) => {
    event.preventDefault()
    const content = event.target.note.value
    event.target.reset()
    addNoteToServer(content)
  }

  if (isPending) {
    return <div>loading data...</div>
  }

  return (
    <div>
      <h2>Notes app</h2>
      <form onSubmit={addNote}>
        <input name="note" />
        <button type="submit">add</button>
      </form>
      {notes.map((note) => (
        <li key={note.id}>
          {note.important ? <strong>{note.content}</strong> : note.content}
          <button onClick={() => toggleImportance(note)}>
            {note.important ? 'make not important' : 'make important'}
          </button>
        </li>
      ))}
    </div>
  )
}

export default App
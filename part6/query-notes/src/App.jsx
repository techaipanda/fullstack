// ===== part6c — Managing data on the server with the TanStack Query library =====
// 课程章节: https://fullstackopen.com/en/part6/many_redux_or_one_question#managing-data-on-the-server-with-the-tanstack-query-library
// 课程原文 verbatim: part6c 第 1 个 H2 — 起始版本(part6-0)展示 + 改造后版本
// 用 useQuery({ queryKey: ['notes'], queryFn: getNotes })(最终 part6-1)。
//
// 课程叙事弧(第 1 个 H2 段 1-段 6):
//   段 1 起始版本:App 是空架子,addNote / toggleImportance 只 console.log,
//   notes 写死 const notes = []。本节起始版本在 part6-0 分支。
//   段 3 改造 1:useQuery({ queryKey: ['notes'], queryFn: async () => fetch... })
//   — 直接内联 fetch,验证 isPending → success 状态机。
//   段 4 提取:fetch 逻辑搬到 src/requests.js 的 getNotes()。
//   段 6 改造 2:queryFn: getNotes(函数引用)。
//   本文件取最终态(段 6 改造 2,即 part6-1)。
//
// verbatim 1:1 对照(段 1 起始 + 段 6 最终态):
//   import { useQuery } from '@tanstack/react-query'
//   import { getNotes } from './requests'
//
//   const App = () => {
//     const addNote = async (event) => {
//       event.preventDefault()
//       const content = event.target.note.value
//       event.target.reset()
//       console.log(content)
//     }
//
//     const toggleImportance = (note) => {
//       console.log('toggle importance of', note.id)
//     }
//
//     const result = useQuery({
//       queryKey: ['notes'],
//       queryFn: getNotes,
//     })
//
//     if (result.isPending) {
//       return <div>loading data...</div>
//     }
//
//     const notes = result.data
//
//     return (
//       <div>
//         <h2>Notes app</h2>
//         <form onSubmit={addNote}>
//           <input name="note" />
//           <button type="submit">add</button>
//         </form>
//         {notes.map((note) => (
//           <li key={note.id} onClick={() => toggleImportance(note)}>
//             {note.important ? <strong>{note.content}</strong> : note.content}
//             <button onClick={() => toggleImportance(note.id)}>
//               {note.important ? 'make not important' : 'make important'}
//             </button>
//           </li>
//         ))}
//       </div>
//     )
//   }
//
// 课程说明:"So the application retrieves data from the server and renders it
// on the screen without using the React hooks useState and useEffect used in
// chapters 2-5 at all. The data on the server is now entirely under the
// administration of the TanStack Query library, and the application does not
// need the state defined with React's useState hook at all!"
//
// 注意:课程 addNote / toggleImportance 仍是 console.log 占位,因为本节不教
// mutation — 那属于下一个 H2 "Synchronizing data to the server using TanStack
// Query"。console.log 在课程里是刻意的 teaching 步骤,verbatim 保留。

import { useQuery } from '@tanstack/react-query'
import { getNotes } from './requests'

const App = () => {
  const addNote = async (event) => {
    event.preventDefault()
    const content = event.target.note.value
    event.target.reset()
    console.log(content)
  }

  const toggleImportance = (note) => {
    console.log('toggle importance of', note.id)
  }

  const result = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  })

  if (result.isPending) {
    return <div>loading data...</div>
  }

  const notes = result.data

  return (
    <div>
      <h2>Notes app</h2>
      <form onSubmit={addNote}>
        <input name="note" />
        <button type="submit">add</button>
      </form>
      {notes.map((note) => (
        <li key={note.id} onClick={() => toggleImportance(note)}>
          {note.important ? <strong>{note.content}</strong> : note.content}
          <button onClick={() => toggleImportance(note.id)}>
            {note.important ? 'make not important' : 'make important'}
          </button>
        </li>
      ))}
    </div>
  )
}

export default App
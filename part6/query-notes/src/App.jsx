// ===== part6c — Synchronizing data to the server using TanStack Query =====
// 课程章节: https://fullstackopen.com/en/part6/react_query_context_api#synchronizing-data-to-the-server-using-tanstack-query
// 课程原文 verbatim: part6c 第 2 个 H2 最终态(part6-2 branch)。
//
// 本节在 part6-1 之上增量:
//   - import 加 useMutation + useQueryClient(从 @tanstack/react-query)
//   - import 加 createNote + updateNote(从 ./requests)
//   - App 体内首句 const queryClient = useQueryClient()
//   - 新增 newNoteMutation = useMutation({ mutationFn: createNote,
//       onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }) })
//   - 新增 updateNoteMutation = useMutation({ mutationFn: updateNote,
//       onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }) })
//   - addNote 函数体改为 newNoteMutation.mutate({ content, important: true })
//   - toggleImportance 函数体改为 updateNoteMutation.mutate(
//       { ...note, important: !note.important })
//
// verbatim 1:1 对照(本节最终 App.jsx):
//   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
//   import { getNotes, createNote, updateNote } from './requests'
//
//   const App = () => {
//     const queryClient = useQueryClient()
//
//     const newNoteMutation = useMutation({
//       mutationFn: createNote,
//       onSuccess: () => {
//         queryClient.invalidateQueries({ queryKey: ['notes'] })
//       }
//     })
//
//     const updateNoteMutation = useMutation({
//       mutationFn: updateNote,
//       onSuccess: () => {
//         queryClient.invalidateQueries({ queryKey: ['notes'] })
//       }
//     })
//
//     const addNote = async (event) => {
//       event.preventDefault()
//       const content = event.target.note.value
//       event.target.reset()
//       newNoteMutation.mutate({ content, important: true })
//     }
//
//     const toggleImportance = (note) => {
//       updateNoteMutation.mutate({...note, important: !note.important })
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
//     return (...)
//   }
//
// 课程要点:
//   - useQueryClient 拿到 QueryClient 实例(在 main.jsx 创建并通过 Provider 注入)
//   - mutationFn 是 async 函数(createNote / updateNote)
//   - onSuccess 在 mutation 成功后回调,这里用 invalidateQueries 让 ['notes']
//     查询失效 → 触发 useQuery 自动 refetch → 数据与 server 同步
//   - 这种 "发完请求后让 query 失效重取" 是 TanStack Query 的官方推荐模式
//
// 注意 verbatim 保留 bug:
//   课程 part6-2 最终态 JSX 仍写 <button onClick={() => toggleImportance(note.id)}>
//   — 但本节新 toggleImportance(note) 要求入参是整个 note 对象,传 note.id(string)
//   会导致 spread `{...note.id}` 抛出(字符串可 spread 但无 important 字段,
//   后续 !note.important 计算没问题但服务端 PUT 不识别)。这是 fullstackopen
//   课程原代码的已知 bug,在下一个 H2 "Optimizing the performance"(part6-3)
//   会修复 — 改 onClick 为 toggleImportance(note)。
//   本节 verbatim 1:1,保留这个 bug。

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotes, createNote, updateNote } from './requests'

const App = () => {
  const queryClient = useQueryClient()

  const newNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })

  const updateNoteMutation = useMutation({
    mutationFn: updateNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })

  const addNote = async (event) => {
    event.preventDefault()
    const content = event.target.note.value
    event.target.reset()
    newNoteMutation.mutate({ content, important: true })
  }

  const toggleImportance = (note) => {
    updateNoteMutation.mutate({...note, important: !note.important })
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
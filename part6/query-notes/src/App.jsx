// ===== part6c — Optimizing the performance =====
// 课程章节: https://fullstackopen.com/en/part6/react_query_context_api#optimizing-the-performance
// 课程原文 verbatim: part6c 第 3 个 H2 最终态(part6-3 branch)。
//
// 本节在 part6-2 之上三处改动:
//   1. 修 button onClick bug(从 toggleImportance(note.id) 改为 toggleImportance(note))
//   2. useQuery 选项加 refetchOnWindowFocus: false
//      — 关掉切 tab 自动 refetch 的默认行为
//   3. newNoteMutation.onSuccess 用 queryClient.setQueryData 手动更新缓存
//      — 取代 invalidateQueries,避免一次额外的 server round-trip
//      — verbatim 形态: const notes = queryClient.getQueryData(['notes'])
//                      queryClient.setQueryData(['notes'], notes.concat(newNote))
//
// updateNoteMutation.onSuccess 仍用 invalidateQueries(课程本节没优化它,
// 因为 updateNote 要 spread 全原 note 才能保留 id/content,setQueryData 写起来
// 反而麻烦;invalidateQueries 是更直接的选择)。
//
// 课程原话末段:"The code for the application is in GitHub in the branch _part6-3_."
//
// 下一个 H2 是 "useNotes custom hook"(part6-4),把 TanStack Query 调用抽到
// src/hooks/useNotes.js,App.jsx 不再直接接触 useQuery / useMutation / useQueryClient。

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotes, createNote, updateNote } from './requests'

const App = () => {
  const queryClient = useQueryClient()

  const newNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      const notes = queryClient.getQueryData(['notes'])
      queryClient.setQueryData(['notes'], notes.concat(newNote))
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
    refetchOnWindowFocus: false
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
          <button onClick={() => toggleImportance(note)}>
            {note.important ? 'make not important' : 'make important'}
          </button>
        </li>
      ))}
    </div>
  )
}

export default App
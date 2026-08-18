// ===== part6c — useNotes custom hook =====
// 课程章节: https://fullstackopen.com/en/part6/react_query_context_api#useNotes-custom-hook
// 课程原文 verbatim: part6c 第 4 个 H2 整段(本节无 H3 子段)。
//
// verbatim 1:1 对照(从课程 §2 代码块抽取):
//   - useQuery({ refetchOnWindowFocus: false }) — 延续 part6-3 的配置
//   - newNoteMutation.onSuccess 用 setQueryData 手动合并(延续 part6-3 优化)
//   - updateNoteMutation.onSuccess 用 invalidateQueries(课程本节没改)
//   - 返回对象字面量: { notes, isPending, addNote, toggleImportance }
//   - addNote 在 hook 内已经包成 (content: string) => mutate({ content, important: true })
//     — 也就是说 hook 这一层就把 mutation 的 payload 形态对调用方隐藏了
//   - toggleImportance 在 hook 内已经包成 (note) => mutate({ ...note, important: !note.important })
//
// 课程说明(本节首段):
// "Our solution is fairly good, but somewhat bothersome is the fact that many
//  TanStack Query implementation details have been placed directly inside the
//  React component. Let's extract these into their own custom hook function."
//
// 课程说明(本节首段,hook 返回对象的字段列表):
// "The hook function ... returns a simple object containing:
//   - notes: the list of notes
//   - isPending: whether the data is still loading
//   - addNote: a function for adding a new note with just a content string
//   - toggleImportance: a function for toggling the importance of a note"
//
// 课程原话末段:"The code for the application is in GitHub in the branch _part6-3_."
// — 注意:本节虽然内容上是新 H2,但末段仍然指向 part6-3 branch,意味着 part6-3
// 同时包含上一次的 setQueryData/refetchOnWindowFocus 改动 + 本次的 useNotes 抽离。
//
// 下一个 H2 是 "Exercises 6.16-6.19"(anecdotes 题),无新 branch,本地不动 App.jsx。

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotes, createNote, updateNote } from '../requests'

export const useNotes = () => {
  const queryClient = useQueryClient()

  const result = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
    refetchOnWindowFocus: false
  })

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

  return {
    notes: result.data,
    isPending: result.isPending,
    addNote: (content) => newNoteMutation.mutate({ content, important: true }),
    toggleImportance: (note) => updateNoteMutation.mutate({
      ...note, important: !note.important
    }),
  }
}
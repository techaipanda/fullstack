// ===== part6b — ### Testing the notes store(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#testing-the-notes-store
// 课程原文 verbatim:part6b.md L1035-L1276 — 测 notes store(含 async actions)。
//
// 课程叙事弧(L1035-L1276):
//   课程 L1083:"This time useNotes also contains a significant amount of
//   logic, so testing should probably be done via hooks with React Testing
//   Library." — useNotes 自己有 filter 逻辑(if filter === 'important' ...),
//   直接测 store 测不到这条路径,所以必须走 renderHook。
//   课程 L1175-L1189 详细解释 vi.mock 替换 services/notes 模块。
//   课程 L1191-L1198:beforeEach 重置 store + vi.clearAllMocks 重置 mock。
//   课程 L1200-L1238:每个 test 先用 mockResolvedValue 控制 mock 行为,
//   再 await act(async () => await result.current.action())。
//   课程 L1241-L1273:第二个 describe 测 useNotes 的 3 个 filter 分支。
//
// verbatim 1:1 对照(L1109-L1271):
//   import { describe, it, expect, beforeEach, vi } from 'vitest'
//   import { renderHook, act } from '@testing-library/react'
//
//   vi.mock('./services/notes', () => ({
//     default: {
//       getAll: vi.fn(),
//       createNew: vi.fn(),
//       update: vi.fn(),
//     }
//   }))
//
//   import noteService from './services/notes'
//   import useNoteStore, { useNotes, useFilter, useNoteActions } from './store'
//
//   beforeEach(() => {
//     useNoteStore.setState({ notes: [], filter: '' })
//     vi.clearAllMocks()
//   })
//
//   describe('useNoteActions', () => {
//     it('initialize loads notes from service', async () => {
//       const mockNotes = [{ id: 1, content: 'Test', important: false }]
//       noteService.getAll.mockResolvedValue(mockNotes)
//
//       const { result } = renderHook(() => useNoteActions())
//
//       await act(async () => {
//         await result.current.initialize()
//       })
//
//       const { result: notesResult } = renderHook(() => useNotes())
//       expect(notesResult.current).toEqual(mockNotes)
//     })
//
//     it('add appends a new note', async () => {
//       const newNote = { id: 2, content: 'New note', important: false }
//       noteService.createNew.mockResolvedValue(newNote)
//
//       const { result } = renderHook(() => useNoteActions())
//
//       await act(async () => {
//         await result.current.add('New note')
//       })
//
//       const { result: notesResult } = renderHook(() => useNotes())
//       expect(notesResult.current).toContainEqual(newNote)
//     })
//
//     it('toggleImportance flips important flag', async () => {
//       const note = { id: 1, content: 'Test', important: false }
//       useNoteStore.setState({ notes: [note] })
//       noteService.update.mockResolvedValue({ ...note, important: true })
//
//       const { result } = renderHook(() => useNoteActions())
//
//       await act(async () => {
//         await result.current.toggleImportance(1)
//       })
//
//       const { result: notesResult } = renderHook(() => useNotes())
//       expect(notesResult.current[0].important).toBe(true)
//     })
//   })
//
//   describe('useNotes filtering', () => {
//     const notes = [
//       { id: 1, content: 'A', important: true },
//       { id: 2, content: 'B', important: false },
//     ]
//
//     beforeEach(() => {
//       useNoteStore.setState({ notes })
//     })
//
//     it('returns all notes with no filter', () => {
//       const { result } = renderHook(() => useNotes())
//       expect(result.current).toHaveLength(2)
//     })
//
//     it('filters important notes', () => {
//       useNoteStore.setState({ notes, filter: 'important' })
//       const { result } = renderHook(() => useNotes())
//       expect(result.current).toEqual([notes[0]])
//     })
//
//     it('filters nonimportant notes', () => {
//       useNoteStore.setState({ notes, filter: 'nonimportant' })
//       const { result } = renderHook(() => useNotes())
//       expect(result.current).toEqual([notes[1]])
//     })
//   })
//
// 课程 L1275:应用最终代码在 GitHub zustand-notes/tree/part6-6 分支。

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('./services/notes', () => ({
  default: {
    getAll: vi.fn(),
    createNew: vi.fn(),
    update: vi.fn(),
  }
}))

import noteService from './services/notes'
// eslint-disable-next-line no-unused-vars -- 课程 L1122 verbatim 导入 useFilter,虽未在 test 里使用,但保留 verbatim 1:1
import useNoteStore, { useNotes, useFilter, useNoteActions } from './store'

beforeEach(() => {
  useNoteStore.setState({ notes: [], filter: '' })
  vi.clearAllMocks()
})

describe('useNoteActions', () => {
  it('initialize loads notes from service', async () => {
    const mockNotes = [{ id: 1, content: 'Test', important: false }]
    noteService.getAll.mockResolvedValue(mockNotes)

    const { result } = renderHook(() => useNoteActions())

    await act(async () => {
      await result.current.initialize()
    })

    const { result: notesResult } = renderHook(() => useNotes())
    expect(notesResult.current).toEqual(mockNotes)
  })

  it('add appends a new note', async () => {
    const newNote = { id: 2, content: 'New note', important: false }
    noteService.createNew.mockResolvedValue(newNote)

    const { result } = renderHook(() => useNoteActions())

    await act(async () => {
      await result.current.add('New note')
    })

    const { result: notesResult } = renderHook(() => useNotes())
    expect(notesResult.current).toContainEqual(newNote)
  })

  it('toggleImportance flips important flag', async () => {
    const note = { id: 1, content: 'Test', important: false }
    useNoteStore.setState({ notes: [note] })
    noteService.update.mockResolvedValue({ ...note, important: true })

    const { result } = renderHook(() => useNoteActions())

    await act(async () => {
      await result.current.toggleImportance(1)
    })

    const { result: notesResult } = renderHook(() => useNotes())
    expect(notesResult.current[0].important).toBe(true)
  })
})

describe('useNotes filtering', () => {
  const notes = [
    { id: 1, content: 'A', important: true },
    { id: 2, content: 'B', important: false },
  ]

  beforeEach(() => {
    useNoteStore.setState({ notes })
  })

  it('returns all notes with no filter', () => {
    const { result } = renderHook(() => useNotes())
    expect(result.current).toHaveLength(2)
  })

  it('filters important notes', () => {
    useNoteStore.setState({ notes, filter: 'important' })
    const { result } = renderHook(() => useNotes())
    expect(result.current).toEqual([notes[0]])
  })

  it('filters nonimportant notes', () => {
    useNoteStore.setState({ notes, filter: 'nonimportant' })
    const { result } = renderHook(() => useNotes())
    expect(result.current).toEqual([notes[1]])
  })
})
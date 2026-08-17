// ===== part6b — ### Async actions(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#async-actions
// 课程原文 verbatim:part6b.md L547-L705 — store 全部 action 改 async + 加 get 参数。
//
// 课程叙事弧(L547-L703):
//   上一节 NoteForm 自己调 noteService.createNew + add(note) + App 自己调
//   noteService.getAll().then(initialize) — fetch 逻辑散落在组件里。
//   这一节把 fetch 全部搬进 store action(Redux thunk 风格):
//     1. add(content)        async,内部 noteService.createNew + set concat
//     2. toggleImportance(id) async,内部 get().notes.find + noteService.update + set map
//     3. initialize()         async,内部 noteService.getAll + set notes
//     4. create 第二个参数加 get,代替 useNoteStore.getState()(课程 L703:
//        "The function get is functionally equivalent to calling
//         useNoteStore.getState(), but is the most idiomatic way to refer
//         to the store's state from within the store's own functions.")
//
// verbatim 1:1 最终态(L596-L615 add/initialize + L684-L701 toggleImportance):
//   import { create } from 'zustand'
//   import noteService from './services/notes' // highlight-line
//
//   const useNoteStore = create((set, get) => ({ // highlight-line
//     notes: [],
//     filter: '',
//     actions: {
//       add: async (content) => {  // highlight-line
//         const newNote = await noteService.createNew(content)  // highlight-line
//         set(state => ({ notes: state.notes.concat(newNote) }))
//       },
//       toggleImportance: async (id) => {
//         const note = get().notes.find(n => n.id === id) // highlight-line
//         const updated = await noteService.update(
//           id, { ...note, important: !note.important }
//         )
//         set(state => ({
//           notes: state.notes.map(n => n.id === id ? updated : n)
//         }))
//       },
//       setFilter: value => set(() => ({ filter: value })),
//       initialize: async () => {  // highlight-line
//         const notes = await noteService.getAll()  // highlight-line
//         set(() => ({ notes }))
//       }
//     }
//   }))
//
// 课程 L617:"The functions add and initialize have thus been changed into
// asynchronous functions, which first call the appropriate noteService function,
// and then update the state."
//
// 课程 L619:"The solution is elegant; state management and communication with
// the server are entirely separated outside of React components."
//
// 课程 L621:"Let's finalize the application by synchronizing the importance
// toggle change to the server." — 这就是 toggleImportance 变 async + 调 update
// 的来历,UI 翻转重要 → server 也更新 → 刷新页面后保留。
//
// 课程 L703:get vs useNoteStore.getState() 的关系。
//
// ⚠️ useNotes / useFilter / useNoteActions 三个 hook 是本项目 More complex state
//    那一节加的 action-sub-object pattern,课程没改,保留 verbatim。
//    课程原文 store.js 只有 const useNoteStore = create(...) 那一坨,但
//    我们的项目实际依赖 useNoteActions() 等 hook 才能让 NoteForm / NoteList 编译。
//    这是课程示例用裸 useNoteStore 直接解构的简化路径(也是合法的 verbatim),
//    但本项目已经走 hook 抽象,删除会让 NoteForm/NoteList 报错 — 故保留。
//
// 课程 L705:本节代码对应 part6-5 分支(zustand-notes/tree/part6-5)。

import { create } from 'zustand'
import { devtools } from 'zustand/middleware' // highlight-line
import noteService from './services/notes' // highlight-line

// highlight-start
// 课程 L770-L781 也演示了一个自定义 logger middleware(为了展示 middleware 形状):
//   const logger = (config) => (set, get) => config(
//     (...args) => {
//       console.log('prev state', get());
//       set(...args);
//       console.log('next state', get());
//     },
//     get
//   )
// curry 形状 (config) => (set, get) => config(...) — 课程 L770 称 "somewhat cryptic"。
// 课程 L811-L826 推出 ready-made 的 devtools,这是小节最终态。
// 课程 L828:"When the Redux DevTools extension is installed in the browser, the
// state of the store and its changes can be inspected in the browser's developer tools"
// highlight-end

const useNoteStore = create(devtools((set, get) => ({ // highlight-line
  notes: [],
  filter: '',
  actions: {
    // highlight-start
    add: async (content) => {  // highlight-line
      const newNote = await noteService.createNew(content)  // highlight-line
      set(state => ({ notes: state.notes.concat(newNote) }))
    },
    // highlight-end
    // highlight-start
    toggleImportance: async (id) => {
      const note = get().notes.find(n => n.id === id) // highlight-line
      const updated = await noteService.update(
        id, { ...note, important: !note.important }
      )
      set(state => ({
        notes: state.notes.map(n => n.id === id ? updated : n)
      }))
    },
    // highlight-end
    setFilter: value => set(() => ({ filter: value })),
    // highlight-start
    initialize: async () => {  // highlight-line
      const notes = await noteService.getAll()  // highlight-line
      set(() => ({ notes }))
    }
    // highlight-end
  }
}))) // highlight-line

// ===== 项目 hook(More complex state 引入,本节课程不动)=====
export const useNotes = () => {
  const notes = useNoteStore((state) => state.notes)
  const filter = useNoteStore((state) => state.filter)

  if (filter === 'important') return notes.filter(n => n.important)
  if (filter === 'nonimportant') return notes.filter(n => !n.important)

  return notes
}

export const useFilter = () => useNoteStore((state) => state.filter)
export const useNoteActions = () => useNoteStore((state) => state.actions)
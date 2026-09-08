// part5 h — Communicating with the server
//
// 课程原文 (line 919-953) 最终 App 组件:"The app is now nicely typed and ready for further development!"
//
// 相对于 sub-section 7 的"成品 App",本节进一步:
//   1. 把 Note 接口从本地移到 ./noteTypes(新建模块)
//   2. 新建 ./noteService 抽离 axios 调用(getAllNotes / createNote)
//   3. App 改用 service 模块 + useEffect 拉取初值
//
// 课程 line 921-952 verbatim — 替换 App 函数体。

import { useState, useEffect } from 'react';
import { Note } from './noteTypes';
import { getAllNotes, createNote } from './noteService';

// ─────────────────────────────────────────────────────────────────────────
// App — 课程 line 926-952 verbatim
//
// 关键代码段(本节相对 sub-section 7 的差异):
//   - useEffect(() => { getAllNotes().then(data => setNotes(data)) }, [])
//     课程 line 930-936:挂载时拉取一次初值
//   - createNote({ content: newNote }).then(data => setNotes(notes.concat(data)))
//     课程 line 941-944:提交后用服务端返回的真实 Note(含 id)更新本地列表
//
// ⭐ 核心概念: useEffect 拉取初值
//  useEffect(() => {...}, []) 第二个参数是依赖数组 []
//    空数组 → effect 只在组件挂载时执行一次,卸载时执行 cleanup
//  为什么不直接写在函数体里:
//    写在外面会在每次 render 时重新拉取,造成无限循环 + 性能浪费
//  服务端不可达时的崩溃:
//    getAllNotes() 失败时 .then 不会执行,notes 永远保持 [] — 本节不处理错误
//    课程 line 864 提到"准备意外情况"但不演示 — 留作后续
//  关联: 课程原文 line 802-815 + line 930-936
//
// ⭐ 核心概念: useState + service 模块的边界
//  setNotes(data) / setNotes(notes.concat(data)) 都用服务端返回的真实 Note
//  之前 sub-section 7 用本地 String(notes.length + 1) 造假 id — 现在改成信任服务端
//  验证: 打开 DevTools network,提交时看 POST /notes 返回的 Note 对象,确认 id 是服务端给的
//  关联: 课程原文 line 873-880 + line 941-944
// ─────────────────────────────────────────────────────────────────────────
const App = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    // highlight-start
    getAllNotes().then(data => {
      setNotes(data)
    })
    // highlight-end
  }, [])

  const noteCreation = (event: React.SyntheticEvent) => {
    event.preventDefault()
    // highlight-start
    createNote({ content: newNote }).then(data => {
      setNotes(notes.concat(data))
    })
    // highlight-end

    setNewNote('')
  };

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
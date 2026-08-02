// part5 b — NoteForm 组件(自管 newNote state)
// 章节: "b — State of the forms"
// 把原本属于 App 的 newNote state + handleNoteChange 移到 NoteForm 内部,
// App 只传 createNote 回调。注意课程原文把 important 硬编码为 true(去掉 Math.random)。
import { useState } from 'react'

const NoteForm = ({ createNote }) => {
  const [newNote, setNewNote] = useState('')

  const addNote = (event) => {
    event.preventDefault()
    createNote({
      content: newNote,
      important: true
    })

    setNewNote('')
  }

  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={event => setNewNote(event.target.value)}
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default NoteForm
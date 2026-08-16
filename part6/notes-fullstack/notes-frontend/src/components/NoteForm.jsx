// part5 b — NoteForm 组件(自管 newNote state)
// 章节: "b — State of the forms"
// part5 c — "About finding the elements" 阶段,给 input 加 placeholder,
// 让测试用 getByPlaceholderText 唯一定位该输入框。
// 课程原文把 important 硬编码为 true(去掉 Math.random)。
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
          placeholder='write note content here'
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default NoteForm
const Note = require('../models/note')
const User = require('../models/user')

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
]

const initialUser = {
  username: 'root',
  name: 'Root User',
  password: 'sekret',
}

// ===== part5d — E2E 测试用的课程原文用户 =====
// 课程章节: Writing on the form (https://fullstackopen.com/en/part5/end_to_end_testing#writing-on-the-form)
// 课程原文 verbatim 用 mluukkai / salainen / Matti Luukkainen,
// E2E 测试按课程原文 1:1 复刻这个 user,而不是用 root。
// 与 initialUser 共存,node:test 跑测时单独 seed。
const initialE2EUser = {
  username: 'mluukkai',
  name: 'Matti Luukkainen',
  password: 'salainen',
}

const nonExistingId = async () => {
  const note = new Note({ content: 'willremovethissoon' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialNotes,
  initialUser,
  initialE2EUser,
  nonExistingId,
  notesInDb,
  usersInDb,
}
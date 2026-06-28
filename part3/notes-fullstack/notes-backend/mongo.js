/*
 * FSO 3.12 — Command line database
 *
 * Usage:
 *   node mongo.js <password>
 *   node mongo.js <password> <content>
 *   node mongo.js <password> <content> true
 *
 * <password> is the first positional argument to match the FSO 3.12 CLI shape.
 * When MONGODB_URI points at the local database (no auth) it is unused.
 * For MongoDB Atlas, inline the credentials into MONGODB_URI in .env.
 */
require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
if (!url) {
  console.error('error: MONGODB_URI is not set')
  console.error('hint:  copy .env.example to .env and set MONGODB_URI')
  process.exit(1)
}

if (process.argv.length < 3) {
  console.log('Usage:')
  console.log('node mongo.js <password>')
  console.log('node mongo.js <password> <content>')
  console.log('node mongo.js <password> <content> true')
  process.exit(1)
}

const password = process.argv[2]
const content = process.argv[3]
const important = process.argv[4] === 'true'

mongoose.set('strictQuery', false)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})
const Note = mongoose.model('Note', noteSchema)

const close = () => mongoose.connection.close()

const listAll = () =>
  Note.find({}).then(notes => {
    if (notes.length === 0) {
      console.log('noteApp is empty')
      return
    }
    notes.forEach(n => {
      const content = n.content ?? '(no content)'
      const tag = n.important ? 'important' : ''
      console.log(`${content} ${tag}`.trim())
    })
  })

const addOne = () => {
  const note = new Note({ content, important })
  return note.save().then(() =>
    console.log(
      `added ${note.content}${note.important ? ' (important)' : ''} to noteApp`,
    ),
  )
}

mongoose
  .connect(url)
  .then(() => {
    if (content) {
      console.log(`adding ${content} to noteApp`)
      return addOne()
    }
    console.log('listing all notes in noteApp')
    return listAll()
  })
  .then(close)
  .catch(err => {
    console.error('error:', err.message)
    close().finally(() => process.exit(1))
  })
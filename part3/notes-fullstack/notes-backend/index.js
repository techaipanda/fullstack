const Note = require('./models/note')

const express = require('express')
const app = express()

// 中间件
app.use(express.json())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  if (request.body && Object.keys(request.body).length > 0) {
    console.log('Body:  ', request.body)
  }
  console.log('---')
  next()
}

app.use(requestLogger)

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))
/*
// 辅助函数
const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}
*/
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// 数据
/*
let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]
*/

// 路由
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes.map(n => n.toJSON()))
  })
})

app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id
  Note.findById(id).then(note => {
    if (note) {
      response.json(note.toJSON())
    } else {
      response.status(404).end()
    }
  })
})

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.status(201).json(savedNote.toJSON())
  })
})

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id
  Note.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  })
})

// 兜底中间件
app.use(unknownEndpoint)

// 启动服务器
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  // console.log('Server running on env:', process.env)
  console.log(`Server running on port ${PORT}`)
})

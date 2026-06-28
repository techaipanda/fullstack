const Note = require('./models/note')

const express = require('express')
const app = express()

// 中间件
app.use(express.static('dist'))
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

app.get('/api/notes', (request, response, next) => {
  Note.find({})
    .then(notes => {
      response.json(notes)
    })
    .catch(error => next(error))
})

app.get('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findById(id).then(note => {
    if (note) {
      response.json(note)
    } else {
      console.log(`note with id ${id} not found`)
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
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
  .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findById(request.params.id)
    .then(note => {
      if (!note) {
        return response.status(404).end()
      }

      note.content = content
      note.important = important

      return note.save().then((updatedNote) => {
        response.json(updatedNote)
      })
    })
    .catch(error => next(error))
})

// 兜底中间件
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

// 启动服务器
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  // console.log('Server running on env:', process.env)
  console.log(`Server running on port ${PORT}`)
})

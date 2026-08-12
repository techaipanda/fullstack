// Part 4b + Part 4c 整合测试。
// 单文件内串行执行 beforeEach，避免跨 worker 共享同一 MongoDB 库引发的竞态。
const { describe, test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Note = require('../models/note')
const User = require('../models/user')
const { signToken } = require('../utils/tokens')

const seedUser = async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash(helper.initialUser.password, 10)
  return new User({
    username: helper.initialUser.username,
    name: helper.initialUser.name,
    passwordHash,
  }).save()
}

const seedNotes = async (user) => {
  await Note.deleteMany({})
  const noteObjects = helper.initialNotes.map((n) =>
    new Note({ ...n, user: user._id }),
  )
  return Promise.all(noteObjects.map((n) => n.save()))
}

const authHeaderFor = (user) => `Bearer ${signToken({ username: user.username, id: user._id })}`

// ===== 登录 =====
describe('login API', () => {
  beforeEach(seedUser)

  test('login succeeds with correct credentials and returns a token', async () => {
    const response = await api
      .post('/api/login')
      .send({
        username: helper.initialUser.username,
        password: helper.initialUser.password,
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(response.body.token)
    assert.strictEqual(response.body.username, helper.initialUser.username)
  })

  test('login fails with wrong password (401)', async () => {
    const response = await api
      .post('/api/login')
      .send({
        username: helper.initialUser.username,
        password: 'wrong',
      })
      .expect(401)

    assert.strictEqual(response.body.token, undefined)
  })

  test('login fails with unknown user (401)', async () => {
    await api
      .post('/api/login')
      .send({ username: 'ghost', password: 'whatever' })
      .expect(401)
  })
})

// ===== 用户注册 =====
describe('user API', () => {
  beforeEach(seedUser)

  test('users are returned as json without exposing passwordHash', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 1)
    assert.strictEqual(response.body[0].username, helper.initialUser.username)
    assert.strictEqual(response.body[0].passwordHash, undefined)
  })

  test('a valid user can be added', async () => {
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, 2)
    assert(usersAtEnd.map((u) => u.username).includes('mluukkai'))
  })

  test('user without username is not added (400)', async () => {
    await api
      .post('/api/users')
      .send({ name: 'NoName', password: 'salainen' })
      .expect(400)

    assert.strictEqual((await helper.usersInDb()).length, 1)
  })

  test('user without password is not added (400)', async () => {
    await api
      .post('/api/users')
      .send({ username: 'nopass', name: 'No Pass' })
      .expect(400)

    assert.strictEqual((await helper.usersInDb()).length, 1)
  })

  test('user with too short password is not added (400)', async () => {
    await api
      .post('/api/users')
      .send({ username: 'shorty', name: 'Short', password: 'ab' })
      .expect(400)

    assert.strictEqual((await helper.usersInDb()).length, 1)
  })

  test('duplicate username is rejected (400)', async () => {
    await api
      .post('/api/users')
      .send({
        username: helper.initialUser.username,
        name: 'Duplicate',
        password: 'another',
      })
      .expect(400)

    assert.strictEqual((await helper.usersInDb()).length, 1)
  })
})

// ===== 笔记 =====
describe('note API', () => {
  let user
  beforeEach(async () => {
    user = await seedUser()
    await seedNotes(user)
  })

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')
    assert.strictEqual(response.body.length, helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')
    const contents = response.body.map((r) => r.content)
    assert(contents.includes('Browser can execute only JavaScript'))
  })

  test('a specific note can be viewed', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToView = notesAtStart[0]

    const response = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.content, noteToView.content)
  })

  test('a note with a malformed id returns 400', async () => {
    await api
      .get('/api/notes/1')
      .expect(400)
  })

  test('a note with a valid but nonexistent id returns 404', async () => {
    const nonexistentId = await helper.nonExistingId()
    await api
      .get(`/api/notes/${nonexistentId}`)
      .expect(404)
  })

  test('a valid note can be added with a valid token', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }

    await api
      .post('/api/notes')
      .set('Authorization', authHeaderFor(user))
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const notesAtEnd = await helper.notesInDb()
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)
    assert(notesAtEnd.map((n) => n.content).includes(newNote.content))

    const refreshed = await User.findById(user._id)
    // seedNotes 时仅把 note 保存到库，未把 id 写回 user.notes；
    // POST /api/notes 才会把新建的 note id 追加到 user.notes
    assert.strictEqual(refreshed.notes.length, 1)
  })

  test('a note without a token is not added (401)', async () => {
    await api
      .post('/api/notes')
      .send({ content: 'this should not be saved', important: true })
      .expect(401)

    assert.strictEqual((await helper.notesInDb()).length, helper.initialNotes.length)
  })

  test('note without content is not added (400)', async () => {
    await api
      .post('/api/notes')
      .set('Authorization', authHeaderFor(user))
      .send({ important: true })
      .expect(400)

    assert.strictEqual((await helper.notesInDb()).length, helper.initialNotes.length)
  })

  test('a note can be deleted by its creator', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .set('Authorization', authHeaderFor(user))
      .expect(204)

    const notesAtEnd = await helper.notesInDb()
    assert.strictEqual(notesAtEnd.length, notesAtStart.length - 1)
    assert(!notesAtEnd.some((note) => note.id === noteToDelete.id))
  })
})

// ===== Part 4 b — Writing on the form（课程 1:1 简版）=====
// 课程原文此时还没有 token（Part 4 c 才加 userExtractor），
// 所以这个 describe block 不调用 seedUser，只 seed notes。
//
// 在当前实现下这个测试**会失败**：
//   - 不带 Authorization → request.user === undefined → controllers/notes.js:25 返回 401
//   - 但课程原文期望 201
//
// 保留它是为了忠实记录「Writing on the form」时刻的代码状态——
// 课程演化轨迹，不是为了通过测试。
describe('note API — Writing on the form (course 1:1)', () => {
  beforeEach(async () => {
    await Note.deleteMany({})
    const noteObjects = helper.initialNotes.map((n) => new Note(n))
    await Promise.all(noteObjects.map((n) => n.save()))
  })

  test('a valid note can be added', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const notesAtEnd = await helper.notesInDb()
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)
    const contents = notesAtEnd.map((n) => n.content)
    assert(contents.includes('async/await simplifies making async calls'))
  })
})

after(async () => {
  await mongoose.connection.close()
})
// ===== part5d — Test initialization(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#test-initialization
// 课程原文(代码块 1)逐字 1:1 复刻:
//   1. require 多解构出 beforeEach
//   2. describe 顶层加 beforeEach({ page }) => page.goto('http://localhost:5173')
//   3. 各 test 内部不再各自 page.goto(共享 beforeEach)
//
// 课程 d.5 在此节做的事:把"打开浏览器 → 访问首页"抽到 beforeEach,
// 让后续每个 test 不重复写 page.goto。
// 这是 Playwright 的标准实践——按 test isolation,每个 test 独立 page,
// 但"准备新页面"是公用步骤。
const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Note app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('front page can be opened', async ({ page }) => {
    const locator = page.getByText('Notes')
    await expect(locator).toBeVisible()
    await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2025')).toBeVisible()
  })

  // ===== part5d — Writing on the form(课程 1:1)=====
  // 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#writing-on-the-form
  // 课程原文(代码块 8)逐字 1:1 复刻:
  //   await page.getByRole('button', { name: 'login' }).click()
  //   await page.getByLabel('username').fill('mluukkai')
  //   await page.getByLabel('password').fill('salainen')
  //   await page.getByRole('button', { name: 'login' }).click()
  //   await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  //
  // 课程截图中的 LoginForm 是 <label>username <input/></label> 这种结构,
  // getByLabel 才能定位到 input。本仓库 LoginForm.jsx 原本是裸 <div>,
  // 为了让课程原文 verbatim 能跑通,LoginForm 改为 <label> 包裹(课程原文如此)。
  //
  // 用户 mluukkai/salainen / name 'Matti Luukkainen' 按课程原文 1:1 复刻,
  // 由 test_helper.js 在 backend 启动时 seed(与现有 root/sekret 共存)。
  test('user can log in', async ({ page }) => {
    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill('mluukkai')
    await page.getByLabel('password').fill('salainen')
    await page.getByRole('button', { name: 'login' }).click()

    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })

  // ===== part5d — Testing note creation(课程 1:1)=====
  // 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#testing-note-creation
  // 课程原文(代码块)逐字 1:1 复刻:
  //   1. 嵌套 describe('when logged in') —— 把"已登录态"的 test 隔离出来
  //   2. 嵌套 beforeEach —— 在 describe 内部再登录一次(每个 test 独立 page)
  //   3. test('a new note can be created') —— 三步:点 new note → 填 textbox → 点 save
  //
  // 课程 d.6 的关键 selector(都要在 frontend 真实存在才能跑):
  //   getByRole('button', { name: 'new note' }) → App.jsx 的 Togglable buttonLabel
  //   getByRole('textbox') → NoteForm 的 <input>(默认 type=text,role=textbox)
  //   getByRole('button', { name: 'save' }) → NoteForm 的 <button type="submit">save</button>
  //
  // Playwright beforeEach 嵌套语义:每个 test 跑前,先跑外层 beforeEach(page.goto),
  // 再跑内层 beforeEach(login)。所以 nested describe 内的 test 起步已是"已登录态"。
  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'login' }).click()
      await page.getByLabel('username').fill('mluukkai')
      await page.getByLabel('password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new note can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new note' }).click()
      await page.getByRole('textbox').fill('a note created by playwright')
      await page.getByRole('button', { name: 'save' }).click()
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })
  })
})
// part5d — Testing our own code
const { test, describe, expect } = require('@playwright/test')

describe('Note app', () => {
  test('front page can be opened', async ({ page }) => {
    await page.goto('http://localhost:5173')

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
    await page.goto('http://localhost:5173')

    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill('mluukkai')
    await page.getByLabel('password').fill('salainen')
    await page.getByRole('button', { name: 'login' }).click()

    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })
})
// ===== part5d — Helper functions for tests(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#helper-functions-for-tests
// 课程原文 verbatim:把 spec 中重复的"点击+填表+提交"步骤抽成 helper function,
// 放到 tests/helper.js,让 spec 主体更聚焦在"断言"而不是"操作"。
//
// 课程 d.10 最终态包括 2 个 helper(本文件 1:1 复刻):
//
//   1. loginWith(page, username, password)
//      → 点 login 按钮 → 填 username → 填 password → 点 login 按钮
//      被 3 处调用:
//        - d.4 'user can log in' 顶层 test
//        - d.6 'when logged in' 嵌套 beforeEach
//        - d.8 'login fails with wrong password' test(密码传 'wrong')
//
//   2. createNote(page, content)
//      → 点 new note 按钮 → 填 textbox → 点 save 按钮
//      被 2 处调用:
//        - d.6 'a new note can be created' test
//        - d.11 (下一节) 'and a note exists' 嵌套 beforeEach(预创建 note 用于改 importance)
//
// 课程原文用 ESM (`export { loginWith, createNote }`),本仓库 e2e-tests/package.json
// 没指定 type=module,所以用 CommonJS (`module.exports`) 与 spec 同款 require。
// 行为 100% 一致,只是模块语法按本仓库现有约定。

const loginWith = async (page, username, password) => {
  await page.getByRole('button', { name: 'login' }).click()
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createNote = async (page, content) => {
  await page.getByRole('button', { name: 'new note' }).click()
  await page.getByRole('textbox').fill(content)
  await page.getByRole('button', { name: 'save' }).click()
}

module.exports = { loginWith, createNote }
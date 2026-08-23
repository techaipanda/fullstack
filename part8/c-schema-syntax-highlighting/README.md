# part8 c — Schema syntax highlighting in VS Code(verbatim 课程 Chapter 2 "Schema syntax highlighting in VS Code" 段)

> **本子项目作用**:把课程 Chapter 2 里的 **Schema syntax highlighting in VS Code** 段做成最小可演示 VS Code GraphQL 高亮配置的 demo。
>
> **关键诚实声明**:本节的 verbatim "代码改动"只有两处:(1) 装 [GraphQL: Language Feature Support](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) 扩展(用户手动操作,无需写代码);(2) 在 `schema.js` 的 `typeDefs` template literal 前加 `/* GraphQL */` 注释 — 这一步我们**早在 part8a 就提前应用了**(见 schema.js)。
>
> 本子项目 = part8a/b 代码 + `.vscode/extensions.json` 推荐扩展到团队 + README walkthrough。

---

## 课程原文要点(verbatim 摘录)

> "The schema in our code is defined using template literal syntax:"

> "The schema contains structural information, but in the code editor the whole content appears in the same color and automatic formatting tools like Prettier cannot format its contents. We can enable GraphQL schema syntax highlighting and, for example, autocompletion in VS Code by installing the [GraphQL: Language Feature Support](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) extension."

> "We need to somehow indicate to the extension that `typeDefs` contains GraphQL. There are several ways to do this. We'll do it now by adding the type-indicating comment `/* GraphQL */` before the template literal string:"
> _(课程配图: VS Code 用 `/* GraphQL */` 注释后 typeDefs 字符串出现彩色语法高亮)_

> "Now the syntax highlighting works. The comment helps the installed extension recognize the string as GraphQL and provide intelligent editor features, but it does not affect the application's runtime. Prettier can now also format the schema."

---

## ⭐ 核心概念(本子项目演示的 3 个)

### ⭐ `/* GraphQL */` 注释 = GraphQL 标记(verbatim 课程核心)
- 在 template literal 字符串前加 `/* GraphQL */` 注释
- 告诉 VS Code 的 GraphQL 扩展:**这一坨字符串是 GraphQL SDL**
- **不影响运行时** — 纯注释,运行时被 JS 引擎忽略
- 课程原文:"The comment helps the installed extension recognize the string as GraphQL and provide intelligent editor features, but it does not affect the application's runtime"

### ⭐ 装扩展后启用的 4 个能力
| 能力 | 没装扩展 | 装了扩展 + `/* GraphQL */` |
|------|--------|------|
| 语法高亮 | ❌ 整段字符串同色 | ✅ `type` / `String` / `!` / `ID` 各有颜色 |
| IntelliSense 自动补全 | ❌ 无 | ✅ 输入 `type P` 自动联想 `Person` |
| Prettier 格式化 | ❌ 不格式化字符串内 | ✅ 自动对齐缩进 |
| Schema 校验 | ❌ 不报错 | ✅ 类型拼错红线 |

### ⭐ `.vscode/extensions.json` 团队推荐机制
- VS Code 打开项目时,如果检测到 `.vscode/extensions.json`,会**弹出推荐安装提示**
- `recommendations` 数组填扩展 marketplace ID(这里是 `GraphQL.vscode-graphql`)
- 团队成员克隆仓库后,一键安装推荐扩展,无需口头告诉每个人
- 这是本子项目**超出课程原文的偏离**(课程没演示这个文件,但属于"VS Code 项目标配")

---

## ⭐ 手动验证清单(请你自己做,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要 VS Code + 一个终端**。

### Step 1 — 装 VS Code 扩展

打开 VS Code → Extensions 面板(`Ctrl + Shift + X`)→ 搜 **"GraphQL: Language Feature Support"**(作者 GraphQL Foundation)→ 点 Install。

或者命令行:

```bash
code --install-extension GraphQL.vscode-graphql
```

**期望**:VS Code 右下角显示扩展已启用。

> ⚠️ **Windows 注意事项**:`code` 命令需要在 VS Code 里按 `Ctrl + Shift + P` → 输入 "shell command" → 选 "Install 'code' command in PATH" 一次。之后 PowerShell 就能用 `code --install-extension ...`。

### Step 2 — 打开本子项目目录

```bash
cd D:\workspace\fullstack_workspace\fullstack\part8\c-schema-syntax-highlighting
code .
```

**期望**:VS Code 打开本项目。**首次打开会弹出右下角提示**:
> "This workspace has extension recommendations. Would you like to review?"

点 **"Show Recommendations"** → 看到 `GraphQL.vscode-graphql` → 点 Install(或 Already installed 跳过)。

⭐ **关键观察**:这就是 `.vscode/extensions.json` 派上用场的地方 — 即使新克隆项目,VS Code 自动提示装扩展,无需口头告诉队友。

### Step 3 — 看 schema.js 高亮效果

打开 `schema.js`,光标停在 `typeDefs` 那个 template literal 字符串内部。

**期望**(按顺序检查):

#### ✅ 高亮生效
- `type` / `String` / `ID` / `Int` / `Boolean` — 关键字色(通常蓝/紫)
- `Person` / `Query` / `findPerson` / `allPersons` / `personCount` — 类型色(通常黄/绿)
- `name` / `phone` / `street` / `city` / `id` — 字段名色
- `!` — Non-Null 标记色(通常橙/红)
- 整个 SDL 字符串不再是单调白色

#### ❌ 高亮没生效
如果还是单色,排查:
1. 扩展没装好 → 重启 VS Code
2. `/* GraphQL */` 注释位置不对 → 必须在 `typeDefs =` 后面、` ` ` ` 前面,**不能写在等号前面**
3. JS 文件关联错了 → 右下角点 "Plain Text" → 选 "JavaScript"

### Step 4 — 测试 IntelliSense 自动补全

在 `typeDefs` 字符串内部、光标停在 `type Query {` 后面回车,开始打 `allPer`:

**期望**:VS Code 弹出 IntelliSense 提示 `allPersons` — 因为扩展从 `Query { allPersons: [Person!]! }` 里知道这个字段名。

### Step 5 — 测试 Prettier 格式化(可选)

如果装了 Prettier 扩展,把光标停在 SDL 字符串内,按 `Shift + Alt + F`(Windows 格式化快捷键)。

**期望**:SDL 内容按 GraphQL 规则缩进对齐(每个字段 2 空格缩进)。

⭐ **没装扩展前**:`Shift + Alt + F` 会**忽略** SDL 字符串内容,只格式化外层 JS。

### Step 6 — 验证 schema.js 里的 `/* GraphQL */` 注释

打开 `schema.js`,确认 typeDefs 定义前有:

```js
const typeDefs = /* GraphQL */ `
  type Person {
```

**期望**:注释存在,位置正确。

⭐ 这个注释**不影响运行时** — 终端跑 `npm start` 一切照常工作,只是 editor 侧的便利。

### Step 7 — 跑 server 验证没坏

```bash
npm install
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/` — 跟 part8a/b 完全一致,确认加 `/* GraphQL */` 注释**没影响运行时**。

### 结束

终端 `Ctrl + C` 停 server。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| GraphQL: Language Feature Support | "GraphQL: Language Feature Support extension" | VS Code 官方 GraphQL 扩展(marketplace ID `GraphQL.vscode-graphql`) | `.vscode/extensions.json` 的 `recommendations` 数组 |
| `/* GraphQL */` | "type-indicating comment /* GraphQL */" | JS 注释里嵌入的语言提示符,告诉扩展把后面的字符串当 GraphQL | `schema.js` |
| template literal syntax | "The schema in our code is defined using template literal syntax" | JS 反引号字符串(` ` ... ` `) | `schema.js` 的 typeDefs 定义 |
| Prettier | "automatic formatting tools like Prettier cannot format its contents" | 代码格式化工具 | Step 5 演示 |
| IntelliSense | "autocompletion in VS Code" | VS Code 内置代码补全提示 | Step 4 演示 |
| `.vscode/extensions.json` | (课程**未提到**,本子项目超出原文的偏离) | VS Code 工作区推荐扩展清单 | `.vscode/extensions.json` |

---

## ⭐ 关键 takeaway(3 条)

1. **`/* GraphQL */` 是 zero-cost 的 IDE 提示符** — 一行注释换 4 项 IDE 能力(高亮/补全/格式化/校验),运行时零开销
2. **VS Code 扩展是单人技能,`.vscode/extensions.json` 是团队技能** — 课程只教前者,但后者让团队/未来的自己不必重新发现
3. **课程这条节奏很经典**:先让你用 plain text 写 schema 感受痛苦(单调 + 不能格式化 + 不能补全)→ 再教 1 行注释解决 — GraphQL 课程后续章节会反复用这个"先痛后解药"的模式

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| 文件结构 | 课程在 Apollo Server 段把 typeDefs + resolvers + persons 全部塞在 `index.js` | **本子项目沿用 part8a/b 结构** — 抽到 `schema.js` | 单子项目内部一致,不动 verbatim |
| `package.json` scripts | 课程 "Highlighted lines 4 to 5" | 已包含 `dev` + `start` | 严格 verbatim |
| `.vscode/extensions.json` | **课程未演示** | **本子项目新增**(超出原文的偏离) | 团队推荐扩展是 VS Code 项目标配;不在课程 verbatim 范围,但属于 part8c 主题(GraphQL in VS Code)的合理延伸 |
| `/* GraphQL */` 注释 | 课程"Schema syntax highlighting"段才讲到 | **早在 part8a 就已加** | 课程讲的是技巧,提前应用无副作用(part8a README 已说明) |
| `requests/` 目录 | 课程没要求 | **本子项目未创建**(可复用 part8a) | 本节无 query 实操,不需要 .graphql 文件 |
| `.gitignore` | 课程没演示 git | 标准 `node_modules/` + log + env | 沿用 part8a |
| Apollo Server 版本 | 课程未指定具体版本 | `@apollo/server@^4.11.0` | 沿用 part8a |
| `graphql` 版本 | 课程未指定 | `^16.9.0` | 沿用 part8a |
| 注释 | 课程用英文注释或无注释 | 中文 ⭐ 注释 + 标注本节 verbatim 改动 | ⭐ memory:`part7/8 学习代码必须含中文注释` + 诚实标注 |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Apollo Server v4 需要 Node.js `^18.0.0 || >=20.0.0`。你的机器上 nvm 装的 `v22.22.3` 满足要求,**无需**额外操作
- **VS Code 版本**:课程假设你用 VS Code。如果你用别的编辑器(WebStorm / Sublime / Vim),GraphQL 高亮效果类似但配置不同
- **`code` 命令 PATH**:`code --install-extension ...` 需要 VS Code 已注册到 PATH(首次装 VS Code 时勾选 "Add to PATH",或者手动从 VS Code 里 `Ctrl + Shift + P` → "Install 'code' command in PATH")
- **推荐扩展提示可能被关掉**:如果你以前 dismiss 过 `.vscode/extensions.json` 的推荐提示,需要手动到 Extensions 面板搜 "GraphQL" 自己装
- **本子项目不涉及**:端口冲突 / Apollo Sandbox 联网 / schema 缓存(本节纯 editor 侧)

---

## 后续子段

- part8c **Schema syntax highlighting in VS Code 已完结**(Chapter 2 editor 侧配置小节)
- 课程 Chapter 2 后续还有这些**有实操代码**的小节:
  - part8d — **Parameters of a resolver**(findPerson 的 args 参数详细解释)— 有代码
  - part8e — **The default resolver**(Apollo 自动给 Person 字段生成的 default resolver)— 有代码
  - part8f — **Object within an object**(Address 嵌套类型)— 有代码
  - part8g — **Mutations**(addPerson)— 有代码
  - part8h — **Error handling**(GraphQLError + BAD_USER_INPUT)— 有代码
  - part8i — **Enum**(YesNo 过滤 phone 是否有值)— 有代码
  - part8j — **Changing a phone number**(changeNumber mutation)— 有代码
  - part8k — **More on queries**(combined queries + aliases)— 有代码
- 后续 part8d/8e/... 会按"一次只推进一小节"纪律逐个落地
- Chapter 3-6 是 React Apollo Client / DB / Login / Fragments — 还没规划
- 本节**不** commit / push
- 本节**不** 跑任何命令
# Phonebook Backend

这是 [Full Stack Open](https://fullstackopen.com/) 课程 Part 3 的练习项目 —— 一个基于 **Node.js + Express** 的电话簿后端服务，提供 RESTful API 用于管理联系人信息。

数据当前存储在内存中（重启服务后会重置为初始数据），主要用来学习 Express 路由、中间件、请求处理等基础概念。

---

## 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [VS Code 调试](#vs-code-调试)
- [API 接口说明](#api-接口说明)
- [使用 REST Client 测试](#使用-rest-client-测试)
- [常见问题](#常见问题)

---

## 技术栈

| 名称 | 版本 | 用途 |
| --- | --- | --- |
| Node.js | ≥ 18.x | 运行时 |
| Express | ^5.2.1 | Web 框架 |
| morgan | ^1.10.1 | HTTP 请求日志中间件 |
| VS Code REST Client | 插件 | 调试接口（可选） |

---

## 项目结构

```
phonebook-backend/
├── .vscode/
│   └── launch.json       # VS Code 调试配置
├── index.js              # 入口文件，包含所有路由与中间件
├── package.json          # 项目元信息与依赖
├── package-lock.json
├── get_all.rest          # REST Client: 获取所有联系人
├── post_person_rest.rest # REST Client: 新增联系人
├── delete.rest           # REST Client: 删除联系人
└── node_modules/
```

---

## 环境要求

- 已安装 **Node.js 18 或更高版本**
- 已安装 **npm**（Node.js 自带）

可通过以下命令检查版本：

```bash
node -v
npm -v
```

---

## 快速开始

### 1. 安装依赖

进入项目目录后执行：

```bash
cd part3/phonebook-backend
npm install
```

### 2. 启动服务

开发模式（推荐，文件变更后会自动重启）：

```bash
npm run dev
```

普通启动：

```bash
npm start
```

启动成功后控制台会输出：

```
Server running on port 3001
```

服务默认监听：**http://localhost:3001**

### 3. 验证服务是否运行

打开浏览器访问 [http://localhost:3001](http://localhost:3001)，可以看到 `Hello World!` 页面；或访问 [http://localhost:3001/api/persons](http://localhost:3001/api/persons) 查看联系人列表（JSON 格式）。

---

## VS Code 调试

项目已经预置了 `.vscode/launch.json`，提供两种调试方式，按需选用即可。

### 方式一：直接启动并调试（推荐新手）

> 适合「按下 F5 就能跑 + 打断点」的常规调试流程。

1. 用 VS Code **单独打开** `part3/phonebook-backend` 目录（`File → Open Folder`），这样 `${workspaceFolder}` 才会指向本项目
2. 打开 `index.js`，在任意行号左侧点击红点设置断点（例如 `app.get('/api/persons', ...)` 内）
3. 切到「Run and Debug」面板（侧边栏 ▶️ 虫子图标，或 `Ctrl+Shift+D`）
4. 在顶部下拉中选择 **`Launch: node index.js (stdio)`**（命名带 `stdio` 是有意为之，见下方 Q6）
5. 点击绿色的播放按钮 ▶️（或按 `F5`）

服务会以调试模式启动，输出会出现在底部的 **Debug Console** 面板。常用快捷键：

| 快捷键 | 作用 |
| --- | --- |
| `F5` | 继续执行 |
| `F10` | 单步跳过（Step Over） |
| `F11` | 单步进入（Step Into） |
| `Shift+F11` | 单步跳出（Step Out） |
| `Shift+F5` | 停止调试 |

### 方式二：附加到手动启动的 Node 进程（边开发边调试）

> 适合已经在终端里跑着开发服务器（`node --watch` / `node --inspect`），只想临时附加调试器的场景。

1. 在终端启动带 inspector 的服务：

   ```bash
   node --inspect=127.0.0.1:9229 index.js
   ```

   或者临时把 `package.json` 的 `start` 脚本改成 `node --inspect=127.0.0.1:9229 index.js`
2. 切到「Run and Debug」面板
3. 选择 **`Attach: localhost:9229`** 配置，点击 ▶️
4. 调试器会连接到已经在 9229 端口监听的 Node 进程

> 小贴士：attach 模式下，被调试的进程由你自己管理（不是 VS Code），所以修改代码后需要手动 `Ctrl+C` 重启服务，再重新按 F5 attach。

### 调试小贴士

- **查看请求体**：在 `app.post('/api/persons', (request, response) => {...})` 内部打断点，鼠标悬停 `request` 可展开 `body`、`params` 等字段
- **条件断点**：右键红点 → 「Edit Breakpoint」→ 设置表达式（如 `request.body.name === 'Arto Hellas'`），满足条件时才停下
- **日志断点**：右键红点 → 「Edit Breakpoint」→ 选择「Log Message」，可在不暂停执行的情况下输出变量值
- **监视窗口**：右侧 WATCH 面板可添加表达式（如 `persons.length`），实时观察变量变化

---

## API 接口说明

所有接口都以 `http://localhost:3001` 为基址。

### 1. 根路径

**请求**

```
GET /
```

**响应**：HTML 文本 `<h1>Hello World!</h1>`

---

### 2. 获取所有联系人

**请求**

```
GET /api/persons
```

**响应示例**

```json
[
  { "id": "1", "name": "Arto Hellas",       "number": "040-123456" },
  { "id": "2", "name": "Ada Lovelace",     "number": "39-44-5323523" },
  { "id": "3", "name": "Dan Abramov",      "number": "12-43-234345" },
  { "id": "4", "name": "Mary Poppendieck", "number": "39-23-6423122" }
]
```

---

### 3. 获取单个联系人

**请求**

```
GET /api/persons/:id
```

**响应**

- 成功（200）：返回对应联系人对象
- 失败（404）：未找到该 ID 时返回空响应

---

### 4. 查看 Phonebook 信息

**请求**

```
GET /info
```

**响应**：HTML 文本，显示当前联系人数量与请求时间，例如：

```html
<p>Phonebook has info for 4 people</p>
<p>Wed Jun 25 2026 12:00:00 GMT+0800 (China Standard Time)</p>
```

---

### 5. 新增联系人

**请求**

```
POST /api/persons
Content-Type: application/json

{
  "name": "Alice Smith",
  "number": "123-456-7890"
}
```

**响应**

- 成功（200）：返回新增的联系人对象（自动生成 `id`）
- 失败（400）：
  - `{"error": "name is missing"}` —— 缺少 `name`
  - `{"error": "number is missing"}` —— 缺少 `number`
  - `{"error": "name must be unique"}` —— `name` 已存在

> **说明**：`id` 由后端通过 `Math.random()` 生成，仅用于演示，未保证全局唯一。

---

### 6. 删除联系人

**请求**

```
DELETE /api/persons/:id
```

**响应**：成功（204）返回空响应。

---

## 使用 REST Client 测试

项目自带 `.rest` 文件，可使用 **VS Code REST Client 插件** 直接发送请求：

1. 在 VS Code 中安装扩展 [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
2. 打开 `get_all.rest` / `post_person_rest.rest` / `delete.rest`
3. 点击文件中 `###` 上方的 `Send Request` 链接即可发送请求

> 注意：使用前请确保后端服务已经启动。

---

## 日志输出

服务使用 `morgan` 中间件打印请求日志，自定义格式中额外输出了 **POST 请求体**：

```
:method :url :status :res[content-length] - :response-time ms :post-data
```

例如：

```
POST /api/persons 200 45 - 1.234 ms {"name":"Alice Smith","number":"123-456-7890"}
```

---

## 常见问题

**Q1：端口 3001 被占用怎么办？**
修改 `index.js` 文件最下方的 `PORT` 常量，例如改为 `3002`，前端调用地址也要同步更新。

**Q2：修改代码后没有自动重启？**
请使用 `npm run dev` 启动（基于 `node --watch`），需要 Node 18+。如使用更老版本 Node，可安装 `nodemon` 替代。

**Q3：数据好像「丢」了？**
当前数据存储在内存中的 `persons` 数组里，**重启服务后会被重置为初始 4 条数据**。这是练习项目的设计，生产环境需要接入数据库（如 MongoDB，课程后续章节会介绍）。

**Q4：可以从前端项目调用这个后端吗？**
可以。这是 Part 3 的后端项目，对应前端通常在 `part2/phonebook` 目录中。前端通过 `http://localhost:3001/api/persons` 访问，注意跨域问题（生产环境会部署到同一来源，或在后端配置 CORS）。

**Q5：VS Code 调试时断点变成灰色（未生效）？**
通常是因为断点位置在「未真正执行的代码路径」上。检查以下几点：
- 启动的是哪个进程——确保选的是 `Launch: node index.js` 而不是 Attach 到了一个无关的 Node 进程
- 启动后是否真的命中过该接口（用 REST Client 或浏览器发一次请求）
- 文件是否在 `${workspaceFolder}` 下——VS Code 调试器要求源码在当前工作区根目录
- 「Run and Debug」面板的底部状态栏里，看一下「Breakpoints」是否被不小心禁用了

**Q6：Windows + nvm-windows 上 js-debug 闪退？**

按 F5 之后看到类似的输出：

```
Debugger attached.
Server running on port 3001
Waiting for the debugger to disconnect...   ← js-debug 在告诉你：进程退出了
```

或者**底部状态栏红一下就消失**，Debug Console 没有任何输出。**`npm start` 直接跑却完全正常**——这是 js-debug 在 Windows 上用默认 IPC 协议时的握手失败问题。

**根因**：js-debug 默认用 Windows 命名管道（IPC）跟 Node.js 的 inspector 通信。在 nvm-windows 安装的 Node 上，这个握手偶尔会失败，导致 js-debug 立即放弃、Node 进程被回收。

**修复**（项目自带的 `launch.json` 已经按此方案调整）：

```json
{
  "type": "node",
  "request": "launch",
  "name": "Launch: node index.js (stdio)",
  "program": "${workspaceFolder}/index.js",
  "transport": "stdio",
  "skipFiles": ["<node_internals>/**"]
}
```

关键就是 `"transport": "stdio"`：让 js-debug 走 stdin/stdout 与 Node 通信，**绕开命名管道**。这也是为什么配置名特意加了 `(stdio)` 后缀，方便一眼看出当前用的是哪种传输。

**修复过程中踩过的其他坑**（避免重复尝试）：

| 改动 | 表现 | 结论 |
| --- | --- | --- |
| `console: "integratedTerminal"` | 进程立即退出 | 不是根因，但可能加剧问题 |
| `console: "internalConsole"` | 启动后状态栏红一下就闪退 | 不是根因 |
| `outputCapture: "std"` | 直接红条报错 | 字段太新，旧版 js-debug 不识别 |
| `restart: true` | 加剧问题不易观察 | 调试阶段先关掉 |
| **`transport: "stdio"`** | ✅ **正常调试** | **最终方案** |

如果 stdio 模式仍有问题，备用方案是 **手动 attach**：终端里 `node --inspect=127.0.0.1:9229 index.js` 启动，再用 `Attach: localhost:9229` 配置附加。

---

## 相关链接

- 课程主页：[https://fullstackopen.com/](https://fullstackopen.com/)
- Part 3 章节：[https://fullstackopen.com/en/part3](https://fullstackopen.com/en/part3)
- Express 官方文档：[https://expressjs.com/](https://expressjs.com/)
- morgan 中间件：[https://github.com/expressjs/morgan](https://github.com/expressjs/morgan)

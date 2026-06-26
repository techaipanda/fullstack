# Phonebook Frontend

这是 [Full Stack Open](https://fullstackopen.com/) 课程 Part 2 的练习项目 —— 一个基于 **React + Vite** 的电话簿前端应用，提供联系人的增删改查、名称过滤、消息提示等常见交互。

后端数据由同目录下的 `db.json` 提供，通过 [json-server](https://github.com/typicode/json-server) 起一个本地 REST API（默认监听 3001 端口），由前端通过 axios 请求。本项目主要用于学习 **React 组件拆分、状态管理、副作用与第三方服务封装**。

---

## 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [功能说明](#功能说明)
- [API 接口说明](#api-接口说明)
- [VS Code 调试](#vs-code-调试)
- [常见问题](#常见问题)
- [相关链接](#相关链接)

---

## 技术栈

| 名称 | 版本 | 用途 |
| --- | --- | --- |
| React | ^19.2.0 | UI 框架 |
| React DOM | ^19.2.0 | 渲染入口 |
| Vite | ^7.2.4 | 构建工具与开发服务器 |
| @vitejs/plugin-react | ^5.1.1 | React Fast Refresh 支持 |
| axios | ^1.13.4 | HTTP 请求库 |
| json-server | ^1.0.0-beta.5 | 本地假后端（基于 `db.json`） |
| ESLint | ^9.39.1 | 代码风格检查 |

---

## 项目结构

```
phonebook/
├── public/                 # Vite 静态资源目录
├── db.json                 # json-server 的数据源（CRUD 操作会写回此文件）
├── eslint.config.js        # ESLint 配置
├── vite.config.js          # Vite 构建配置
├── index.html              # HTML 入口
├── package.json
└── src/
    ├── main.jsx            # 应用入口（createRoot 挂载）
    ├── App.jsx             # 顶层组件：管理所有状态与业务流程
    ├── index.css           # 全局样式
    ├── components/
    │   ├── Filter.jsx      # 名称过滤输入框
    │   ├── PersonForm.jsx  # 新增 / 更新联系人的表单
    │   ├── Person.jsx      # 联系人列表与删除按钮
    │   └── Notification.jsx# 成功 / 错误消息提示
    └── services/
        └── phonebook.js    # 封装 axios：getAll / create / updatePerson / deletePerson
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

本项目由 **两个独立的进程** 组成，需要分别启动：

1. **json-server**（后端假数据，端口 `3001`）
2. **Vite 开发服务器**（前端，端口 `5173`）

### 1. 安装依赖

进入项目目录后执行：

```bash
cd part2/phonebook
npm install
```

### 2. 启动后端（json-server）

```bash
npm run server
```

成功后终端会显示：

```
Resources
http://localhost:3001/persons

Home
http://localhost:3001
```

### 3. 启动前端（Vite）

新开一个终端窗口，运行：

```bash
npm run dev
```

成功后 Vite 会输出：

```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 4. 打开应用

浏览器访问 [http://localhost:5173](http://localhost:5173)，即可看到 Phonebook 界面。

> **小贴士**：建议在两个终端窗口分别跑 `npm run server` 和 `npm run dev`，方便分别查看日志。

---

## 功能说明

| 功能 | 入口 | 行为 |
| --- | --- | --- |
| 列出联系人 | 页面加载时自动调用 | 通过 `phoneBookService.getAll()` 拉取 `db.json` 中的数据 |
| 名称过滤 | 顶部 `filter shown with` 输入框 | 实时按子串匹配（不区分大小写） |
| 新增联系人 | 「Add a new」表单 | POST 到 `/persons`，成功后追加到列表并显示绿色提示 |
| 更新号码 | 重名时弹窗确认 | PUT 到 `/persons/:id`，显示绿色提示 |
| 删除联系人 | 联系人后的 `delete` 按钮 | 弹窗确认后 DELETE，如果后端已不存在则显示红色提示并同步移除本地数据 |
| 错误提示 | 任意异步失败 | 显示红色 Notification，5 秒后自动消失 |

> 提示：Notification 的成功 / 错误样式由 `index.css` 中的 `.success` / `.error` class 控制。

---

## API 接口说明

后端由 json-server 自动根据 `db.json` 的根字段生成。本项目的根字段是 `persons`，所以所有接口都以 `http://localhost:3001/persons` 为基址。

| Method | Path | 说明 | Request Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/persons` | 获取所有联系人 | — | `Person[]` |
| GET | `/persons/:id` | 获取单个联系人 | — | `Person` 或 404 |
| POST | `/persons` | 新增联系人 | `{ name, number }` | `Person`（含自动生成的 `id`） |
| PUT | `/persons/:id` | 整体替换联系人 | `{ name, number }` | `Person` |
| DELETE | `/persons/:id` | 删除联系人 | — | 空响应（200） |

`Person` 类型：

```ts
{
  id: string        // json-server 自动生成
  name: string
  number: string
}
```

也可以直接访问 [http://localhost:3001/persons](http://localhost:3001/persons) 在浏览器中查看 JSON。

---

## VS Code 调试

Vite 项目默认就有良好的 SourceMap 支持，浏览器调试即可。但如果你想 **直接在 VS Code 里打断点**调试 React 组件，可以装一个 Chrome / Edge 扩展：[JavaScript Debugger](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-js-debug)（VS Code 自带）。

> 简单的「按下 F5 就能跑」配置可以参考下面，保存为 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against Vite",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

然后先 `npm run dev`，再按 F5 启动一个新 Chrome 窗口并自动附加调试器。

> 后端 json-server 进程**不归 VS Code 管**——它一直在 3001 端口跑着，单独调试前端不需要碰它。

---

## 常见问题

**Q1：刷新页面后新增的联系人还在吗？**
**在的**。json-server 默认会把所有变更 **写回 `db.json`**，所以「真实」保存在项目根目录下。`db.json` 会随操作持续更新。如果想重置数据，恢复到 git 提交时的初始内容即可：

```bash
git checkout db.json
```

**Q2：浏览器打开 5173 端口页面空白 / 报网络错误？**
通常是 **json-server 没起**。检查：
- 另一个终端窗口里 `npm run server` 是否还在跑
- 终端输出是否有 `Resources` 和 `http://localhost:3001/persons`
- 直接访问 [http://localhost:3001/persons](http://localhost:3001/persons) 是否能返回 JSON

**Q3：端口 3001 或 5173 被占用？**

- json-server 端口：修改 `package.json` 的 `server` 脚本，例如改为 `json-server -p 3002 db.json`，**同时**改 `src/services/phonebook.js` 顶部的 `baseUrl`。
- Vite 端口：Vite 会自动选择下一个可用端口（5174、5175...），直接看终端输出访问新地址即可。

**Q4：怎么打包部署？**

```bash
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览构建产物
```

`dist/` 里的静态文件可以部署到任何静态服务器（Netlify / Vercel / GitHub Pages 等）。注意：**json-server 不会被打包**，生产环境需要替换为真实后端（课程 Part 3 / Part 4 会介绍）。

**Q5：代码里一堆 `console.log` 看着乱？**
`App.jsx` 顶部的 `console.log('render', persons.length, 'persons')` 和 `useEffect` 里的 `console.log('effect')` / `console.log('promise fulfilled')` 是 **Part 2 课程故意保留** 的调试输出，用来观察组件渲染与副作用触发时机。学习完成后可以删掉。

**Q6：生产构建时 ESLint 报错？**
本项目 ESLint 仅作为开发辅助使用。如需在 CI 中严格检查，运行：

```bash
npm run lint
```

---

## 相关链接

- 课程主页：[https://fullstackopen.com/](https://fullstackopen.com/)
- Part 2 章节：[https://fullstackopen.com/en/part2](https://fullstackopen.com/en/part2)
- Vite 官方文档：[https://vite.dev/](https://vite.dev/)
- React 官方文档：[https://react.dev/](https://react.dev/)
- json-server：[https://github.com/typicode/json-server](https://github.com/typicode/json-server)
- axios：[https://axios-http.com/](https://axios-http.com/)
- 对应后端项目（Part 3）：`part3/phonebook-backend`

# Notes Fullstack

Full Stack Open Part 3 课程练习 —— 整合部署的笔记应用。

一个全栈单页应用：React 前端 + Express 后端 + REST API，前端构建产物由后端统一提供静态服务，可作为整体部署到 Render 等 PaaS 平台。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19、Vite 7、Axios |
| 后端 | Node.js、Express 5、CORS |
| 构建 | Vite（前端）、`npm run build:ui`（一体化构建） |
| 部署 | Render |

## 目录结构

```
notes-fullstack/
├── notes-backend/          # Express 后端（同时托管前端静态资源）
│   ├── index.js            # 应用入口（API + static）
│   ├── package.json        # 含 build:ui 一体化构建脚本
│   └── *.rest              # REST Client 测试用例
└── notes-frontend/         # React + Vite 前端
    ├── src/
    │   ├── components/     # 组件
    │   ├── services/notes.js  # Axios 封装，调用 /api/notes
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js      # 含 /api → :3001 的开发代理
    └── package.json
```

## 本地开发

需要 **两个终端**：

**终端 1 —— 启动后端（端口 3001）：**

```bash
cd notes-backend
npm install
npm run dev
```

**终端 2 —— 启动前端（端口 5173）：**

```bash
cd notes-frontend
npm install
npm run dev
```

打开 `http://localhost:5173`。前端通过 Vite 代理把 `/api/*` 转发到 `http://localhost:3001`，因此本地无跨域问题。

## 一体化构建

后端提供 `build:ui` 脚本，把前端构建产物拷到后端目录：

```bash
cd notes-backend
npm run build:ui
```

执行顺序：

1. `npm install` —— 装后端依赖
2. `rm -rf dist` —— 清理旧产物
3. `cd ../notes-frontend && npm install` —— 装前端依赖
4. `npm run build` —— Vite 构建，输出 `notes-frontend/dist/`
5. `cp -r dist ../notes-backend` —— 把产物拷到 `notes-backend/dist/`

完成后，`notes-backend/dist/` 即为可部署的完整产物。`notes-backend/index.js` 里的 `app.use(express.static('dist'))` 会托管这些静态资源。

## API 接口

所有接口以 `/api/notes` 为根。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/notes` | 获取全部笔记 |
| GET | `/api/notes/:id` | 获取单条笔记 |
| POST | `/api/notes` | 新建笔记，body 需包含 `content` |
| DELETE | `/api/notes/:id` | 删除笔记 |
| PUT | `/api/notes/:id` | 更新笔记（前端 `update` 方法调用） |

## Render 部署

把 `notes-fullstack` 仓库关联到 Render 后，新建 **Web Service** 时配置如下：

| 配置项 | 值 |
|---|---|
| Root Directory | `part3/notes-fullstack/notes-backend` |
| Build Command | `npm run build:ui` |
| Start Command | `npm start` |
| Runtime | Node |

`build:ui` 在 Render 构建阶段会同时安装前后端依赖、构建前端、并把产物拷回后端；启动时 `node index.js` 监听 `process.env.PORT`（Render 自动注入）。

> 免费层实例 15 分钟无请求会休眠，首次访问需要 30–60 秒冷启动。

## 关键设计点

- **静态资源由后端托管**：避免跨域，生产环境与本地同源（前端直接请求相对路径 `/api/notes`）。
- **CORS 已开启**：保留 `app.use(cors())`，方便前后端拆开部署或独立调试。
- **请求日志中间件**：`requestLogger` 在开发期打印 Method / Path / Body。
- **环境变量端口**：`const PORT = process.env.PORT || 3001`，本地默认 3001，云平台自动注入。
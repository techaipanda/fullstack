/**
 * 跨平台启动/停止脚本 —— notes-fullstack 一体化开发服务
 *
 * 用法:
 *   node scripts/dev.js start
 *   node scripts/dev.js stop
 *   node scripts/dev.js restart
 *
 * 行为:
 *   - start: 同时启动 notes-backend (3001) + notes-frontend (5173)
 *   - stop:  通过 PID 文件优雅关闭，必要时按端口兜底
 *   - restart: stop + start
 *
 * 平台差异处理:
 *   - Windows: 直接 spawn npm.cmd（不套 shell），输出写日志文件。
 *     关键点：不能 stdio:'inherit'，否则父 cmd.exe 一退出，
 *     子进程的 console handle 关闭，npm.cmd 第一次写 stdout 就崩。
 *   - Unix:    detached 启动 + kill 进程组 (-PID)。
 *
 * 日志文件: scripts/<name>.dev.log（每个服务一个，append 模式）
 */

const { spawn, spawnSync } = require('node:child_process')
const fs = require('node:fs')
const net = require('node:net')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const PID_FILE = path.join(__dirname, '.dev-pids.json')

const BACKEND_DIR = path.join(ROOT, 'notes-backend')
const FRONTEND_DIR = path.join(ROOT, 'notes-frontend')
const BACKEND_PORT = 3001
const FRONTEND_PORT = 5173

const isWindows = process.platform === 'win32'

// ---------- PID 文件 ----------

function readPids() {
  try {
    return JSON.parse(fs.readFileSync(PID_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function writePids(pids) {
  fs.writeFileSync(PID_FILE, JSON.stringify(pids, null, 2))
}

function isAlive(pid) {
  if (!pid) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

// 端口连通性检查（1.5s 超时）。用于确认服务真的在监听，
// 而不只是 wrapper 进程还活着（例如 node --watch 等待文件变更时）。
function isPortListening(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host })
    let done = false
    const finish = (result) => {
      if (done) return
      done = true
      socket.destroy()
      resolve(result)
    }
    socket.once('connect', () => finish(true))
    socket.once('error', () => finish(false))
    setTimeout(() => finish(false), 1500)
  })
}

// 综合判断：PID 活着 + 端口在监听 = 服务健康
async function isServiceHealthy(pid, port) {
  if (!isAlive(pid)) return false
  return await isPortListening(port)
}

// 兼容新旧两种 PID 文件格式：旧的是数字，新的是 { pid, logFile }
function getPid(entry) {
  if (entry == null) return null
  return typeof entry === 'object' ? entry.pid : entry
}

// ---------- 依赖检查 ----------

// 启动前快速检查 node_modules 是否存在，缺失时给清晰提示。
// 注意：脚本本身不自动跑 npm install —— 那通常由用户 / CI 控制；
// 但如果 'dev' 脚本依赖的关键命令不在 .bin 里，至少要明确报错。
function ensureDeps(name, cwd) {
  const nm = path.join(cwd, 'node_modules')
  if (fs.existsSync(nm)) return true

  console.error(`[${name}] missing dependencies: ${nm}`)
  console.error(`[${name}] run: cd ${path.relative(ROOT, cwd) || '.'} && npm install`)
  return false
}

// ---------- 杀进程 ----------

function killTree(pid) {
  if (!isAlive(pid)) return
  if (isWindows) {
    // /t 杀整棵子树，覆盖 npm.cmd → node --watch
    spawnSync('taskkill', ['/pid', String(pid), '/f', '/t'], { stdio: 'ignore' })
  } else {
    try { process.kill(-pid, 'SIGTERM') } catch { /* 进程组可能已退出 */ }
    setTimeout(() => {
      if (isAlive(pid)) {
        try { process.kill(-pid, 'SIGKILL') } catch { /* ignore */ }
      }
    }, 1500)
  }
}

function killByPort(port) {
  if (isWindows) {
    const out = spawnSync('netstat', ['-aon'], { encoding: 'utf8' }).stdout || ''
    const pids = new Set()
    for (const line of out.split('\n')) {
      if (line.match(new RegExp(`[:.]${port}\\s`))) {
        const parts = line.trim().split(/\s+/)
        const pid = parseInt(parts[parts.length - 1], 10)
        if (pid && pid !== 0 && pid !== 4) pids.add(pid)
      }
    }
    for (const pid of pids) {
      spawnSync('taskkill', ['/f', '/pid', String(pid)], { stdio: 'ignore' })
    }
    return [...pids]
  }
  spawnSync('bash', ['-c', `lsof -ti:${port} 2>/dev/null | xargs -r kill -9`], {
    stdio: 'ignore',
  })
  return []
}

// ---------- 启动 ----------

// 直接调 node 跑实际脚本，绕开 npm → cmd.exe 嵌套。
// 关键：在 Windows 上 npm 会 spawn cmd.exe /d /s /c "..."，那个 cmd.exe
// 不会继承父进程的 windowsHide 标志，会分配新 console 窗口（黑框）。
// 直接 spawn node.exe + detached:true + windowsHide:true → libuv 同时设置
// DETACHED_PROCESS 和 CREATE_NO_WINDOW → 不会弹黑框。
function startService(name, cwd) {
  const logFile = path.join(__dirname, `${name}.dev.log`)

  // 日志文件 + 终端 双写
  const logFd = fs.openSync(logFile, 'a')

  let command, args, extraEnv = {}

  if (name === 'backend') {
    // 替代 `cross-env NODE_ENV=development node --watch index.js`：
    // cross-env 的唯一作用是设环境变量，spawn 的 env 选项就能做到。
    command = process.execPath
    args = ['--watch', 'index.js']
    extraEnv = { NODE_ENV: 'development' }
  } else if (name === 'frontend') {
    // 替代 `vite`：直接执行 vite 自带的 Node 入口
    const viteBin = path.join(cwd, 'node_modules', 'vite', 'bin', 'vite.js')
    if (!fs.existsSync(viteBin)) {
      console.error(`[${name}] vite not found at ${viteBin}`)
      console.error(`[${name}] run: cd ${path.relative(ROOT, cwd) || '.'} && npm install`)
      fs.closeSync(logFd)
      return null
    }
    command = process.execPath
    args = [viteBin]
  } else {
    console.error(`[${name}] unknown service`)
    fs.closeSync(logFd)
    return null
  }

  // stdio 用 'pipe' 而不是文件 fd —— 这样 dev.js 可以把输出转发到
  // 当前终端（用户在 start.bat 窗口里能看到实时日志）。
  // 子进程是 detached:true，dev.js 退出后它们继续在后台跑。
  const child = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
    windowsHide: true,
    env: { ...process.env, FORCE_COLOR: '0', ...extraEnv },
  })

  // 把子进程的输出同时写到：终端（带前缀，便于分辨是哪个服务）+ 日志文件
  const tag = Buffer.from(`[${name}] `)
  const relay = (src) => {
    src.on('data', (chunk) => {
      process.stdout.write(tag)
      process.stdout.write(chunk)
      fs.writeSync(logFd, chunk)
    })
  }
  relay(child.stdout)
  relay(child.stderr)

  child.unref()
  return { pid: child.pid, logFile }
}

// ---------- 主流程 ----------

// 本次启动的子进程 —— 用于 SIGINT 时统一 kill
let startedChildren = []

function killStarted() {
  for (const info of startedChildren) {
    if (info && info.pid) killTree(info.pid)
  }
}

// 每个服务对应的端口，用于 isServiceHealthy() 做端口连通性检查
const SERVICE_PORTS = {
  backend: BACKEND_PORT,
  frontend: FRONTEND_PORT,
}

async function startAll() {
  const pids = readPids()
  const result = {}
  startedChildren = []

  for (const [name, dir] of [
    ['backend',  BACKEND_DIR],
    ['frontend', FRONTEND_DIR],
  ]) {
    const port = SERVICE_PORTS[name]
    const existingPid = getPid(pids[name])

    // 双检查：PID 活着 && 端口在监听 = 服务真的健康
    if (existingPid && await isServiceHealthy(existingPid, port)) {
      console.log(`[${name}] already running (PID ${existingPid}, :${port})`)
      result[name] = pids[name]
      continue
    }

    // 旧 PID 残留（进程死了 或 端口没监听）→ 先清干净再启动
    if (existingPid && isAlive(existingPid)) {
      console.log(`[${name}] stale wrapper PID ${existingPid} (no :${port}) — cleaning up`)
      killTree(existingPid)
    }

    if (!ensureDeps(name, dir)) {
      console.error(`[${name}] skip start (deps missing)`)
      continue
    }
    console.log(`[${name}] starting...`)
    const info = startService(name, dir)
    if (!info) {
      console.error(`[${name}] failed to start`)
      continue
    }
    result[name] = info
    startedChildren.push(info)
    console.log(`[${name}] started PID ${info.pid}`)
    console.log(`[${name}] log   ${info.logFile}`)
  }

  if (result.backend && result.frontend) {
    writePids(result)
    console.log('')
    console.log('All services running.')
    console.log(`  Backend  -> http://localhost:${BACKEND_PORT}/api/notes`)
    console.log(`  Frontend -> http://localhost:${FRONTEND_PORT}`)
    console.log(`  PIDs     -> ${PID_FILE}`)
    console.log('')
    console.log('  >>> Press Enter to close this window (services keep running). <<<')
    console.log('  >>> Press Ctrl+C to stop services. <<<')
    waitForEnterOrInterrupt()
  } else {
    console.error('\nOne or more services failed to start. Check the messages above.')
    process.exit(1)
  }
}

// 等待用户按 Enter（关窗但保留后台服务）
// 或 Ctrl+C（关窗 + 杀掉后台服务）
function waitForEnterOrInterrupt() {
  // Ctrl+C：杀子进程后退出
  process.on('SIGINT', () => {
    console.log('\n[dev] SIGINT received, stopping services...')
    killStarted()
    process.exit(0)
  })

  // 如果 stdin 不是 TTY（比如 CI/管道），不阻塞、直接退出
  if (!process.stdin.isTTY) {
    return
  }

  process.stdin.setEncoding('utf8')
  process.stdin.on('data', () => {
    console.log('[dev] closing window. Services continue running in background.')
    console.log('[dev] run scripts/stop.bat to stop them later.')
    process.exit(0)
  })

  // 不让 dev.js 因为没活动句柄而自动退出
  process.stdin.resume()
}

function stopAll() {
  const pids = readPids()
  let stopped = 0

  for (const [name, entry] of Object.entries(pids)) {
    const pid = getPid(entry)
    if (isAlive(pid)) {
      console.log(`[${name}] stopping PID ${pid}...`)
      killTree(pid)
      stopped++
    } else if (pid) {
      console.log(`[${name}] PID ${pid} not alive (stale entry)`)
    }
  }

  // 兜底：PID 文件丢了 / 进程已泄漏时，按端口再清一遍
  console.log('[cleanup] checking ports 3001, 5173...')
  for (const [name, port] of [
    ['backend',  BACKEND_PORT],
    ['frontend', FRONTEND_PORT],
  ]) {
    const killed = killByPort(port)
    if (killed.length) {
      console.log(`[cleanup] killed ${killed.length} stray process(es) on :${port} (${name})`)
      stopped += killed.length
    }
  }

  if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE)

  if (stopped === 0) {
    console.log('No running services found.')
  } else {
    console.log(`\nStopped ${stopped} process(es).`)
  }
}

// ---------- 入口 ----------

const action = process.argv[2]

if (action === 'start') {
  startAll().catch((err) => {
    console.error('start failed:', err)
    process.exit(1)
  })
} else if (action === 'stop') {
  stopAll()
} else if (action === 'restart') {
  stopAll()
  setTimeout(() => startAll().catch((err) => {
    console.error('restart failed:', err)
    process.exit(1)
  }), 1500)
} else {
  console.log('Usage: node scripts/dev.js <start|stop|restart>')
  process.exit(1)
}

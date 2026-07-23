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
 *   - Windows: 用 taskkill /f /t 杀进程树（npm.cmd 子进程连带 node --watch）
 *   - Unix:    detached 启动 + kill 进程组 (-PID)
 */

const { spawn, spawnSync } = require('node:child_process')
const fs = require('node:fs')
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

function startService(_name, cwd) {
  const child = spawn('npm', ['run', 'dev'], {
    cwd,
    stdio: 'inherit',
    detached: true,       // 两边都需要：父进程退出后子进程继续存活
    shell: isWindows,     // Windows: 需要 shell 解析 .cmd
    windowsHide: true,    // Windows: 不弹黑色 console 窗口
  })

  // 让 spawn 后的子进程不阻止父进程退出
  child.unref()

  return child.pid
}

// ---------- 主流程 ----------

function startAll() {
  const pids = readPids()
  const result = {}

  for (const [name, dir] of [
    ['backend',  BACKEND_DIR],
    ['frontend', FRONTEND_DIR],
  ]) {
    if (isAlive(pids[name])) {
      console.log(`[${name}] already running (PID ${pids[name]})`)
      result[name] = pids[name]
    } else {
      console.log(`[${name}] starting...`)
      const pid = startService(name, dir)
      result[name] = pid
      console.log(`[${name}] started PID ${pid}`)
    }
  }

  writePids(result)
  console.log('')
  console.log('All services running.')
  console.log(`  Backend  -> http://localhost:${BACKEND_PORT}/api/notes`)
  console.log(`  Frontend -> http://localhost:${FRONTEND_PORT}`)
  console.log(`  PIDs     -> ${PID_FILE}`)
}

function stopAll() {
  const pids = readPids()
  let stopped = 0

  for (const [name, pid] of Object.entries(pids)) {
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
  startAll()
} else if (action === 'stop') {
  stopAll()
} else if (action === 'restart') {
  stopAll()
  setTimeout(startAll, 1500)
} else {
  console.log('Usage: node scripts/dev.js <start|stop|restart>')
  process.exit(1)
}

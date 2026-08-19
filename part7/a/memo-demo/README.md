# part7 a.2 — useMemo

**GateGuard 4-item**:无 importer · 纯 markdown 学习笔记 · 用户指令 "继续推进 useMemo"

对应 Full Stack Open part7 a.2 子段(锚点 `#usememo`):

> <https://fullstackopen.com/en/part7/more_about_react_hooks#usememo>

## 段 1 — 引入:每次 re-render 整段函数体都重跑

> "Every time a React component re-renders, the entire function body runs again."

## 段 2 — 引入例子:按搜索词过滤的大列表

> "Consider a component that renders a large list of items filtered by a search term:"

### 代码块 1 — 无 useMemo 的 `FilteredList`(verbatim)

```javascript
import { useState } from 'react'

const expensiveCalculation = () => {
  let sum = 0
  for (let i = 0; i < 100000; i++) sum += i
  return sum
}

const ITEMS = Array.from({ length: 10000 }, (_, i) => `item ${i + 1}`)

const FilteredList = () => {
  const [filter, setFilter] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  console.log('filtering...')
  const filtered = ITEMS.filter(item => {
    expensiveCalculation()
    return item.includes(filter)
  })

  return (
    <div style={{ background: darkMode ? '#333' : '#fff' }}>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="filter items"
      />
      <button onClick={() => setDarkMode(!darkMode)}>toggle dark mode</button>
      <ul>
        {filtered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}

export default FilteredList
```

## 段 3 — 问题:点 dark mode 按钮也会重过滤

> "The problem of the component is that clicking the dark mode button would re-filter
> the entire list even though `filter` didn't change."

(实际看到 console 反复打印 `filtering...`,即使输入框没动、只切 dark mode,
每次切都重跑 `ITEMS.filter` + `expensiveCalculation`。)

## 段 4 — 解决方案:用 `useMemo`

> "We can fix this with useMemo:"

### 代码块 2 — 用 `useMemo` 的 `FilteredList`(verbatim,课程原文末尾 `//...` 是省略号)

```javascript
import { useState, useMemo } from 'react'
const FilteredList = () => {
  const [filter, setFilter] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  const filtered = useMemo(() => {
    console.log('filtering...')
    return ITEMS.filter(item => {
      expensiveCalculation()
      return item.includes(filter)
    })
  }, [filter])
  return (
    <div style={{ background: darkMode ? '#333' : '#fff' }}>
      //...
    </div>
  )
}
```

> 实际 `src/FilteredList.jsx` 把 `//...` 还原成完整 JSX(见 README 末尾"verbatim 偏离说明")。

## 段 5 — 用 useMemo 的效果

> "With useMemo, the expensive filtering only runs when filter changes."

(切 dark mode 不再触发 `filtering...` 日志;改输入框才触发。)

## 段 6 — dependency array 跟 `useEffect` 一样

> "The dependency array works exactly like the one in useEffect:
> React compares each value to the previous render."

## 段 7 — 进阶:用 useMemo memoize 对象/数组 props

> "useMemo can also be used to memoize objects and arrays passed as props, preventing
> unnecessary re-renders of child components that use reference equality."

### 代码块 3 — `App` 用 `useMemo` memoize options 对象(verbatim)

```javascript
const App = () => {
  const [filter, setFilter] = useState('')

  // Without useMemo, 'options' is a new object on every render even if filter hasn't changed
  const options = useMemo(() => ({ caseSensitive: false, filter }), [filter])
  return <SearchResults options={options} />
}
```

> 没有 useMemo 时,即使 `filter` 没变,`options` 也是新对象(引用不同),
> `SearchResults` 会因为 prop reference 变了而 re-render。

## 段 8 — useMemo 是性能优化,不是默认

> "useMemo is a performance optimisation, you should not reach for it by default.
> Premature memoisation adds complexity without benefit when the computation is fast.
> Measure first, and only add useMemo when you have confirmed that a particular
> calculation is a bottleneck."

---

## 关键 takeaway

| 编号 | takeaway |
|---|---|
| 1 | `useMemo(() => fn, deps)` 只在 `deps` 变化时重跑 `fn`,否则返回上次缓存 |
| 2 | `deps` 数组语义跟 `useEffect` 一样 — React 比较新旧值 |
| 3 | useMemo 可用来 memoize **对象/数组** props,稳定引用以避免子组件 re-render |
| 4 | **不要默认用** — 是性能优化,先 measure 确认瓶颈再加 |
| 5 | 计算很快时,加 useMemo 反而引入复杂度,没收益 |

## 本地源码 vs 课程 verbatim 偏离说明

| 文件 | 偏离 | 原因 |
|---|---|---|
| `src/FilteredList.jsx` | 把代码块 2 末尾 `//...` 还原成完整 JSX(div/input/button/ul) | 省略号在可运行代码里无法编译;JSX 与代码块 1 完全一致 |
| `src/App.jsx` | 顶部补 `import { useState, useMemo } from 'react'; import FilteredList from './FilteredList.jsx'; import SearchResults from './SearchResults.jsx';` | 课程代码块 3 没给 imports,补上后可运行 |
| `src/App.jsx` | 在 `useMemo` 之外加了 h1 + input + 包裹 SearchResults/FilteredList 的 JSX | 课程代码块 3 只展示 `useMemo` 那行;补成完整组件才能在浏览器看到效果 |
| `src/SearchResults.jsx` | 完整实现占位组件(展示 caseSensitive + filter) | 课程只提到 `<SearchResults options={options} />`,没给实现;占位以让浏览器有输出 |

## 项目结构

```text
part7/a/memo-demo/
├── .gitignore
├── README.md
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── FilteredList.jsx
    ├── SearchResults.jsx
    ├── index.css
    └── main.jsx
```

## 运行

```bash
cd part7/a/memo-demo
npm install
npm run dev
```

打开浏览器 console,操作:
1. 在输入框打字 → 看到 `filtering...` 日志
2. 点 "toggle dark mode" → **不再**看到 `filtering...`(useMemo 缓存)
3. 切回输入框 → 再次看到 `filtering...`(filter 变化)

## a.3 — React.memo

对应 Full Stack Open part7 a.3 子段(锚点 `#reactmemo`):

> <https://fullstackopen.com/en/part7/more_about_react_hooks#reactmemo>

### 段 1 — 引入:React.memo 缓存整个组件的渲染输出

> "While useMemo caches the result of a calculation inside a component, React.memo
> takes a different angle: it caches the rendered output of an entire component.
> React.memo is not a hook but a higher-order component, and we cover it here
> because it complements useMemo well. When a component is wrapped in React.memo,
> React skips re-rendering it if its props have not changed since the last render."

### 段 2 — 浅比较

> "Without React.memo, MyComponent re-renders every time its parent renders, even
> if value is the same. With it, React compares the old and new props using
> shallow equality, and only re-renders when something has actually changed."

### 段 3 — React.memo 只对 props 浅比较

> "Note that React.memo only checks props. If the component uses a context value
> or its own state, it will still re-render when those change."

### 段 4 — 跟 useMemo 天然配对

> "React.memo pairs naturally with useMemo that prevents expensive calculations
> from re-running, while React.memo prevents the component itself from re-rendering."

### 段 5 — 失效场景:新函数/对象引用每次都变

> "If a memoised component receives a new function or object reference on every
> render, the memoisation is defeated, which is where useCallback comes in."

### 课程 verbatim 代码块 — MyComponent

```javascript
const MyComponent = React.memo(({ value }) => {
  console.log('rendered')
  return <div>{value}</div>
})
```

> 实际 `src/MyComponent.jsx` 用 React 17+ `import { memo }` 替代 `React.memo`,
> 拆成 `MyComponentBase` + `memo()` 包裹两步,方便加中文注释。

### 关键 takeaway

| 编号 | takeaway |
|---|---|
| 1 | `React.memo` **不是 hook**,是 Higher-Order Component(HOC) |
| 2 | `React.memo` 默认对 props 做 **shallow equality**(对象/数组比引用) |
| 3 | 字符串/数字等 primitive 自动值比较 |
| 4 | 跟 `useMemo` 天然配对:useMemo 稳定 props 引用,memo 跳过组件 render |
| 5 | **失效场景**:函数/对象 props 每次都新建 → memo 永远 fail → 用 a.4 `useCallback` 解决 |
| 6 | React.memo 只对 props 浅比较 — context / 自身 state 变化仍然会 re-render |

### 本地源码 vs 课程 verbatim 偏离说明

| 文件 | 偏离 | 原因 |
|---|---|---|
| `src/MyComponent.jsx` | `import { memo } from 'react'` 替代 `React.memo` | React 17+ 推荐 named import |
| `src/MyComponent.jsx` | 拆成 `MyComponentBase` + `memo()` 包裹两步 | 方便在 Base 上加注释 |
| `src/SearchResults.jsx` | 用 `memo()` 包裹整个组件(课程未提及) | 演示"配对 useMemo + React.memo" |
| `src/App.jsx` | 加 `other` 独立 state + 按钮 "bump unrelated state" | 验证:无关 state 变化时,React.memo 包裹的子组件不重渲染 |
| `src/App.jsx` | 加 `myValue = useMemo(() => ..., [filter])` | 演示 primitive props + useMemo 配对 |

### 验证步骤(README 末尾"运行"段后插)

打开浏览器 console,操作:
1. 在输入框打字 → 看到 `SearchResults rendered` + `MyComponent rendered` + `filtering...`
2. 点 "bump unrelated state" 按钮 → **看不到** `SearchResults rendered`、`MyComponent rendered`
   (因为 props 引用都没变,React.memo 跳过它们)
3. 但 `filtering...` 不触发(因为跟 useMemo 缓存)
4. 再次输入框打字 → 看到 `SearchResults rendered` + `MyComponent rendered`(options 引用变了)

---

## a.4 — useCallback

对应 Full Stack Open part7 a.4 子段(锚点 `#usecallback`):

> <https://fullstackopen.com/en/part7/more_about_react_hooks#usecallback>

### 段 1 — 引入:函数 prop 也会让 memo 失效

> "React.memo does not automatically work with function props passed from a parent component.
> The problem is that whenever the component re-renders, all the event handler functions it
> defines are also redefined."

### 段 2 — 函数是对象引用

> "This is because functions are objects in JavaScript, and the equality check on the
> function references fails when they are redefined."

### 段 3 — 解法:useCallback 缓存函数引用

> "useCallback works just like useMemo, except that it caches a function definition
> instead of a calculated value."

### 段 4 — useCallback(fn, deps) vs useMemo(() => fn, deps)

> "The signature is useCallback(callback, dependencies). When the dependencies don't change,
> the callback returned is the same reference as before."

### 段 5 — 失效场景:依赖项还是变了

> "If the callback depends on a value that does change, the function reference will
> still change and the memoisation will not help."

### 课程 verbatim 代码块 — IncrementButton + App

```javascript
// 子组件:接收函数 prop + React.memo 包裹
const IncrementButton = React.memo(({ onIncrement }) => {
  console.log('IncrementButton rendered')
  return <button onClick={onIncrement}>+1</button>
})

// 父组件 App:用 useCallback 稳定函数引用
const App = () => {
  const [count, setCount] = useState(0)

  // ❌ 没有 useCallback 时,这个函数每次 render 都新建 — 引用每次都不同
  // const handleIncrement = () => setCount(count + 1)

  // ✅ 用 useCallback + 函数式更新 → 引用永远稳定
  const handleIncrement = useCallback(() => setCount(c => c + 1), [])

  return (
    <div>
      <p>count: {count}</p>
      <IncrementButton onIncrement={handleIncrement} />
    </div>
  )
}
```

> 实际 `src/App.jsx` / `src/IncrementButton.jsx` 用 React 17+ `import { memo }` + `import { useCallback }` 替代 `React.memo` / `useCallback`,拆成 Base + memo 包裹两步,方便加中文注释。

### 关键 takeaway

| 编号 | takeaway |
|---|---|
| 1 | `useCallback(fn, deps)` 只在 `deps` 变化时返回**同一个函数引用** — 否则返回上次缓存的函数 |
| 2 | 本质上 `useCallback(fn, deps) ≈ useMemo(() => fn, deps)` |
| 3 | **典型用法**:把回调传给被 `React.memo` 包裹的子组件,避免子组件不必要的 re-render |
| 4 | 函数式更新 (`setCount(c => c + 1)`) 让 deps 可以是空数组 `[]` — 函数引用永远不变 |
| 5 | 如果 deps 里的值变了,函数引用也会变 — memo 仍然失效(段 5) |
| 6 | 性能优化,不是默认 — 先 measure,确认瓶颈再加 |

### 本地源码 vs 课程 verbatim 偏离说明

| 文件 | 偏离 | 原因 |
|---|---|---|
| `src/IncrementButton.jsx` | `import { memo }` 替代 `React.memo` | React 17+ 推荐 named import |
| `src/IncrementButton.jsx` | 拆成 `IncrementButtonBase` + `memo()` 包裹两步 | 方便在 Base 上加 ⭐ 核心概念 注释 |
| `src/IncrementButton.jsx` | 加 `console.log('IncrementButton rendered')` | 验证 memo 生效/失效(课程代码块没加,但本地版本需要观测点) |
| `src/App.jsx` | `handleIncrement` 用 `useCallback(() => setCount(c => c + 1), [])` | 课程代码块 1 推荐写法 — 函数式更新让 deps 为空 |
| `src/App.jsx` | 把 IncrementButton + count state 加在原有 App 里 | 课程代码块是独立的最小演示,本地要跟 a.2/a.3 复用同一个 App 才能在浏览器对照验证 |

### 验证步骤(a.4)

打开浏览器 console,操作:
1. 在输入框打字 → 看到 `SearchResults rendered` + `MyComponent rendered` + `IncrementButton rendered` + `filtering...`(因为 options / myValue / handleIncrement 都重新计算或第一次渲染)
2. 点 "bump unrelated state" 按钮 → **看不到** `SearchResults rendered` / `MyComponent rendered` / `IncrementButton rendered`
   - `options` 引用稳定(useMemo)
   - `myValue` 引用稳定(useMemo)
   - `handleIncrement` 引用稳定(useCallback + 空 deps)
   - React.memo 全部跳过
3. 点 "+1" 按钮 → count 变了 → 但 `handleIncrement` 引用没变(空 deps) → IncrementButton 跳过
4. **实验**:把 `useCallback(() => setCount(c => c + 1), [])` 改成 `() => setCount(c => c + 1)`(去掉 useCallback)
   - 重复步骤 2 → 这次会**看到** `IncrementButton rendered`(memo 失效)
   - 这就是 useCallback 存在的意义

---

## a.5 — Custom hooks

对应 Full Stack Open part7 a.5 子段(锚点 `#custom-hooks`):

> <https://fullstackopen.com/en/part7/more_about_react_hooks#custom-hooks>

### 段 1 — 引入:抽离 stateful logic

> "Extracting reusable logic into custom hooks is one of the most common patterns
> in React. A custom hook is just a regular JavaScript function whose name starts
> with use and that may call other hooks."

### 段 2 — 命名约定

> "By convention, custom hooks start with use. This convention is not enforced but
> lint rules and React itself rely on it to identify hooks."

### 段 3 — 复用表单 input 状态管理

> "We can extract the input state handling into a custom hook, so we can reuse it
> across all the input fields of the form."

### 段 4 — spread 模式简化用法

> "With the spread syntax, the input fields can be written much more cleanly:
> `<input {...nameField} />`."

### 课程 verbatim 代码块 — useField

```javascript
import { useState } from 'react'

export const useField = (name) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  return {
    type: 'text',
    value,
    onChange
  }
}
```

### 关键 takeaway

| 编号 | takeaway |
|---|---|
| 1 | Custom hook 本质是普通 JS 函数,**必须**以 `use*` 开头(命名约定) |
| 2 | 内部可以调用其他 hooks(useState / useEffect / 自定义 hooks…) |
| 3 | 跟普通函数的区别:custom hook **跨渲染持有 state**(内部用 useState) |
| 4 | 返回**任何**东西:值 / 对象 / 数组 / 函数 — 课程 spread 模式返回 `{ type, value, onChange }` 对象 |
| 5 | 跟"组件抽取"的区别:custom hook 抽的是**逻辑**(不是 UI),返回任意数据结构 |
| 6 | 同一个 hook 多次调用 → **独立的** state 槽位(React 按调用顺序识别) |

### 本地源码 vs 课程 verbatim 偏离说明

| 文件 | 偏离 | 原因 |
|---|---|---|
| `src/hooks/useField.js` | 把 hook 拆到独立文件(课程代码块直接在组件文件) | 现代项目惯例 — 放 `src/hooks/` 目录,方便多个组件复用 |
| `src/App.jsx` | 同时演示 `nameField` + `phoneField` 两个 useField 调用 | 验证 takeaway #6 — 同一 hook 多次调用、独立的 state |
| `src/App.jsx` | 加 `<p>name value: ...</p>` 显示当前值 | 在浏览器直接观察 useField 内部的 state(无需打开 React DevTools) |

### 验证步骤(a.5)

打开浏览器:
1. 在 `name` 输入框打字 → 下方 `name value: ...` 实时更新
2. 在 `phone` 输入框打字 → 下方 `phone value: ...` 实时更新
3. 两个 input **互不干扰** → 证明同一 hook 多次调用 = 独立 state 槽位
4. 点 "bump unrelated state" 按钮 → App 重渲染 → input 输入的值**不丢失** → 证明 useField 内部 useState 状态被 React 保留

---

## a.6 — Spread attributes

对应 Full Stack Open part7 a.6 子段(锚点未在课程目录里标注):

> <https://fullstackopen.com/en/part7/more_about_react_hooks#spread-attributes>

### 段 1 — spread 语法简化 props 传递

> "Since the name object has exactly all of the attributes that the input element expects
> to receive as props, we can pass the props to the element using the spread syntax
> in the following way: `<input {...name} />`."

### 段 2 — React 文档的等价写法对照

> "As the example in the React documentation states, the following two ways of passing
> props to a component achieve the exact same result:"

```jsx
<Greeting firstName='Arto' lastName='Hellas' />

const person = {
  firstName: 'Arto',
  lastName: 'Hellas'
}

<Greeting {...person} />
```

### 段 3 — 完整 App 简化版(verbatim)

```jsx
const App = () => {
  const name = useField('text')
  const born = useField('date')
  const height = useField('number')

  return (
    <div>
      <form>
        name: <input {...name} />
        <br />
        birthdate: <input {...born} />
        <br />
        height: <input {...height} />
      </form>
      <div>
        {name.value} {born.value} {height.value}
      </div>
    </div>
  )
}
```

### 段 4 — 表单状态封装的价值

> "Dealing with forms is greatly simplified when the unpleasant nitty-gritty details
> related to synchronizing the state of the form are encapsulated inside our custom hook."

### 课程代码块对应的 useField 签名变化

课程 a.6 的 `useField(type)` 把第一个参数当 `type` 属性(text / date / number),
而 a.5 我们的 `useField(name)` 把第一个参数当 `name` 属性。

本地版本选择保留 **name 属性** 语义 + 写死 `type: 'text'`,理由:

- 课程从 a.5 → a.6 改了签名(从 `useField(name)` → `useField(type)`),这不是"渐进"
- 保留 name 属性更接近浏览器 `<input name="...">` 的实际用法(表单提交时用)
- type 写死 'text' 是简化,实际项目应该两种参数都接受: `useField({ name, type })`

### 关键 takeaway

| 编号 | takeaway |
|---|---|
| 1 | Spread `{...obj}` 把对象的所有**可枚举属性**作为独立 props 传下去 |
| 2 | `<input {...nameField} />` 等价于 `<input type="text" value={...} onChange={...} />` |
| 3 | 适用场景:custom hook 返回的对象属性恰好匹配组件期望的 props |
| 4 | React 文档等价写法:`<Greeting firstName=... lastName=... />` 与 `<Greeting {...person} />` 完全等价 |
| 5 | 表单状态封装的价值:同步 input state 的细节隐藏在 hook 里,父组件只关心"显示什么 / 提交时做什么" |
| 6 | **本演示扩展**:useField 返回 `reset` 方法,form `onSubmit` 时清空所有字段 |

### 本地源码 vs 课程 verbatim 偏离说明

| 文件 | 偏离 | 原因 |
|---|---|---|
| `src/hooks/useField.js` | 保留 `useField(name)` 签名(name 当 name 属性),课程 a.6 用 `useField(type)`(第一个参数当 type) | a.5 → a.6 渐进,保留已有签名 |
| `src/hooks/useField.js` | 加 `reset` 方法到返回对象 | 演示段 4 "encapsulated inside our custom hook" — 表单提交时 reset 也是应封装的行为 |
| `src/App.jsx` | 在 `<form>` 加 `onSubmit` 处理器(课程代码块没给 submit 逻辑) | 演示 reset 行为:点 "reset" 按钮 → nameField.reset() + phoneField.reset() |
| `src/App.jsx` | 加 `<button type="submit">reset</button>` | 触发 form onSubmit |

### 验证步骤(a.6)

打开浏览器:
1. 在 `name` 输入框打字 "Alice" → 下方 `name value: Alice`
2. 在 `phone` 输入框打字 "12345" → 下方 `phone value: 12345`
3. 点 "reset" 按钮 → 表单触发 onSubmit → `nameField.reset()` + `phoneField.reset()` → 两个输入框**瞬间清空** → 下方变 `(empty)`
4. 打开 console:**没有 "search" 或其他报错** → 证明 spread + reset 都正常工作

---

## a 后续 — Persisting State with a Custom Hook (useLocalStorage)

对应 Full Stack Open part7 a 后续段 "Persisting State with a Custom Hook":

> <https://fullstackopen.com/en/part7/more_about_react_hooks>

### 段 1 — 引入:custom hook 可以组合多个内置 hook

> "Custom hooks can combine several built-in hooks to encapsulate more complex behaviour.
> A commonly needed feature is persisting state to localStorage so that it survives
> a page refresh. Here is a useLocalStorage hook that wraps useState and keeps the
> value in sync with localStorage:"

### 课程 verbatim 代码块 1 — useLocalStorage 实现

```javascript
import { useState } from 'react'

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}
```

### 段 2 — 行为说明

> "The hook accepts a storage key and an initial value. On the first render it reads
> from localStorage, falling back to initialValue if nothing is stored yet. The returned
> setter updates both React state and localStorage at the same time."

### 课程 verbatim 代码块 2 — App 用法(你引用的那段)

```javascript
const App = () => {
  const [name, setName] = useLocalStorage('name', '')

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <p>Hello, {name}! (your name is stored in localStorage)</p>
    </div>
  )
}
```

### 段 3 — 封装价值的总结

> "The component has no idea that localStorage is involved. That concern is entirely
> hidden inside the hook."

### 关键 takeaway

| 编号 | takeaway |
|---|---|
| 1 | Custom hook 可以**组合多个内置 hook** — 这里是 `useState` + `localStorage` |
| 2 | API 设计模仿 `useState`:返回 `[value, setValue]` 元组,父组件无感知 |
| 3 | 用 `useState(() => ...)` **lazy initializer**:读 localStorage 只在第一次渲染跑 |
| 4 | `setValue` 同步更新两处:React state + `window.localStorage.setItem(...)` |
| 5 | localStorage 只能存字符串,所有值都要 `JSON.stringify` / `JSON.parse` |
| 6 | 必须 try/catch:SSR 没有 `window`、隐私模式禁用、5MB 写满都可能抛错 |
| 7 | **核心价值**:父组件用法跟 `useState` 一模一样,持久化细节完全隐藏在 hook 内 |

### 本地源码 vs 课程 verbatim 偏离说明

| 文件 | 偏离 | 原因 |
|---|---|---|
| `src/hooks/useLocalStorage.js` | 完整保留课程 verbatim 代码块 | 课程代码已经是生产级(try/catch + lazy init),无需修改 |
| `src/hooks/useLocalStorage.js` | 加大量中文 ⭐ 核心概念注释 | 解释 lazy initializer、同步两处写入、try/catch 必要性 |
| `src/App.jsx` | 加 useLocalStorage 演示区块(`<input>` + `<p>Hello, ...</p>`) | 课程 App 是独立最小演示,本地版本要跟 useField 区块共存 |
| `src/App.jsx` | 把 `<p>` 文案改成 `Hello, {name || 'stranger'}!` | 空字符串时给个 fallback,避免显示 "Hello, !" |

### 验证步骤(useLocalStorage)

打开浏览器:
1. 在新加的 `useLocalStorage` input 输入 "Alice" → 下方变 `Hello, Alice!`
2. **按 F5 刷新页面** → input 和 `<p>` 仍然显示 "Alice" ← 关键证据,证明从 localStorage 恢复
3. 打开 DevTools → Application → Local Storage → 看到 `name: "Alice"` 键值对
4. 改成 "Bob" → 刷新 → 显示 "Bob"
5. 清空 input → 刷新 → 显示空字符串(没显示 "stranger",因为 storedValue 是 '' 而非 undefined)
6. DevTools 里手动 `localStorage.removeItem('name')` 然后刷新 → 显示空(因为 initialValue 是 '')

---

## 后续子段

- a.7 Exercises 7.1.-7.6.

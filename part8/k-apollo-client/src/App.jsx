// ⭐ App.jsx — part8k 最小占位组件
//
// ⭐ 关键诚实声明:课程本节("Apollo client")**未给 App.jsx 的具体内容**
//   课程只 import 它,然后所有数据展示留给后续章节:
//   - part8l "Making queries" — useQuery + 数据展示
//   - part8n "Doing mutations" — useMutation
//
//   本文件 = **非课程原文** — Vite 工程需要 App.jsx 才能编译,所以给最小占位
//   verbatim 课程的 import:`import App from './App.jsx'`

const App = () => {
  // ⭐ 最简占位:渲染一段提示文字,证明 ApolloProvider + React 渲染链路通了
  // 真正的数据展示(把 query 响应渲染到 JSX)在 part8l 落地
  return (
    <div>
      <h2>part8k — Apollo client ready</h2>
      <p>
        Check the browser console (F12) — you should see the allPersons response
        from the Chapter 2 server (part8j). If you see it, Apollo Client is wired
        correctly. If you see CORS errors, see README.md "Troubleshooting".
      </p>
    </div>
  )
}

export default App

// ⭐ App.jsx — part8n "Doing mutations"(verbatim 课程)
//
// ⭐ 关键诚实声明:课程本子节**改 App.jsx**
//   课程明示 App.jsx 要加 import PersonForm + 渲染 <PersonForm />
//   课程原文高亮 line 3(import)+ line 15-20(JSX 渲染)
//
// ⭐ 课程原文核心(逐字保留):
//   "Enable the PersonForm component in the file App.jsx"
//   "New persons are added just fine, but the screen is not updated.
//    This is because Apollo Client cannot automatically update the cache
//    of an application, so it still contains the state from before the mutation."
//
// ⭐⭐ 关键诚实 ⭐⭐:
//   课程本节**故意**不做"cache 自动更新" — 这是 part8o "Updating the cache" 的内容
//   part8n 这一节展示的"半成品"行为:mutation 成功但 UI 不刷新
//   这是 Apollo Client 的真实行为特征,part8o 才讲解解法(pollInterval / refetchQueries)

// ⭐ gql 走主路径 — verbatim 课程
import { gql } from '@apollo/client'

// ⭐ useQuery 走子路径 — verbatim 课程
import { useQuery } from '@apollo/client/react'

// ⭐⭐⭐ 新增 import:PersonForm(课程高亮 line 3)⭐⭐⭐
import PersonForm from './components/PersonForm'

// ⭐ Persons 子组件 import — verbatim 课程 part8m(沿用)
import Persons from './components/Persons'

// ⭐⭐⭐ ALL_PERSONS query 定义 — verbatim part8m(part8n 不改)⭐⭐⭐
const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`

// ⭐⭐⭐ App 组件 — verbatim 课程最终态 ⭐⭐⭐
const App = () => {
  const result = useQuery(ALL_PERSONS)

  if (result.loading) {
    return <div>loading...</div>
  }

  // ⭐⭐⭐ 课程高亮 line 15-20:JSX 改了两个地方 ⭐⭐⭐
  // 1. 包一层 `<div>` — 因为现在要返回 2 个并列元素(Persons + PersonForm)
  // 2. 加 `<PersonForm />` — 把表单挂到主视图下面
  //
  // ⭐ 关键诚实:课程这里**没有**给 PersonForm 传 props
  //   PersonForm 现在是无 props 的独立组件(课程下文才加 setError prop — part8q "Handling mutation errors")
  //   所以本节按 verbatim 不传 props
  return (
    <div>
      <Persons persons={result.data.allPersons} />
      <PersonForm />
    </div>
  )
}

// ⭐ 课程 verbatim — default export,让 main.jsx 能 import App
export default App
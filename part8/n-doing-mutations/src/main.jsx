// ⭐ main.jsx — part8n "Doing mutations" 入口(verbatim 沿用 part8m)
//
// ⭐ 关键诚实声明:课程本子节**不改 main.jsx**
//   课程本节只改 src/App.jsx(渲染 <PersonForm />) + 新建 src/components/PersonForm.jsx
//   main.jsx 的 ApolloClient / HttpLink / InMemoryCache / ApolloProvider 基础设施不动

// ⭐ React 核心 imports — verbatim part8m(part8n 不改)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// ⭐ Apollo Client 核心 imports — verbatim part8m(part8n 不改)
import {
  ApolloClient, gql,
  HttpLink,
  InMemoryCache
} from '@apollo/client'

// ⭐ ApolloProvider 子路径 imports — verbatim part8m(part8n 不改)
import {
  ApolloProvider
} from '@apollo/client/react'

// ⭐⭐ ApolloClient 实例化 — verbatim part8m ⭐⭐
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
  cache: new InMemoryCache(),
})

// ⭐⭐⭐ ApolloProvider 包裹 — verbatim part8m ⭐⭐⭐
//
// 仍然必需 — PersonForm 组件里的 useMutation(CREATE_PERSON) 内部通过 React Context 拿 client
// 没有 Provider,useMutation 报"Could not find Apollo Client context"
createRoot(document.getElementById('root')).render(
  (
    <StrictMode>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </StrictMode>
  ),
)
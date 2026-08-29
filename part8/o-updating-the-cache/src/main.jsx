// ⭐ main.jsx — part8o "Updating the cache" 入口(verbatim 沿用 part8n)
//
// ⭐ 关键诚实声明:课程本子节**不改 main.jsx**
//   课程本节改 3 个文件(抽 ALL_PERSONS / FIND_PERSON / CREATE_PERSON 到 src/queries.js)
//   + PersonForm.jsx 加 refetchQueries option
//   main.jsx 的 ApolloClient / HttpLink / InMemoryCache / ApolloProvider 基础设施不动

// ⭐ React 核心 imports — verbatim part8n(part8o 不改)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// ⭐ Apollo Client 核心 imports — verbatim part8n(part8o 不改)
import {
  ApolloClient,
  HttpLink,
  InMemoryCache
} from '@apollo/client'

// ⭐ ApolloProvider 子路径 imports — verbatim part8n(part8o 不改)
import {
  ApolloProvider
} from '@apollo/client/react'

// ⭐⭐ ApolloClient 实例化 — verbatim part8n ⭐⭐
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
  cache: new InMemoryCache(),
})

// ⭐⭐⭐ ApolloProvider 包裹 — verbatim part8n ⭐⭐⭐
//
// 仍然必需 — App.jsx / Persons.jsx / PersonForm.jsx 里的 useQuery / useMutation
// 内部通过 React Context 拿 client
// 没有 Provider,所有 hook 都报"Could not find Apollo Client context"
createRoot(document.getElementById('root')).render(
  (
    <StrictMode>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </StrictMode>
  ),
)
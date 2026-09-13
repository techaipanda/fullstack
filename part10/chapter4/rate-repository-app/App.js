// chapter4-GraphQL and Apollo client
// 改动:加 import { ApolloProvider } from '@apollo/client/react';和
//  import createApolloClient from './src/utils/apolloClient';顶层
//  const apolloClient = createApolloClient();放在 App 外(模块级,
//  re-render 不重建 client);JSX 把 <Main /> 包进
//  <ApolloProvider client={apolloClient}>...</ApolloProvider>,嵌在
//  <NativeRouter> 内层(路由逻辑仍由 NativeRouter 接管,Apollo 仅注入
//  client context 给子树)。
// 为什么:ApolloProvider 用 React Context 把 apolloClient 注入到
//  useQuery/useMutation/useApolloClient 内部;client 必须模块级单例
//  (放进组件函数里会随 re-render 反复 new,丢失 cache 和订阅);
//  ApolloProvider 放 NativeRouter 内层,因为 Router 的 children
//  Route 用 useNavigate() 时也可同时调 useQuery(),不冲突。
//
// ⚠ MOOC 章节内部不一致:chapter-3 "Routing" 把 StatusBar style 改成
//  "auto",chapter-4 "GraphQL and Apollo client" / "Enhancing" /
//  "Context" 三处又都用 "light"。本节 delta 只新增 ApolloProvider,
//  未要求改 StatusBar,此处保留 "auto"(跟 chapter-3 末态一致),
//  不偷偷回滚。后续 chapter-4 "Enhancing Apollo Client's requests"
//  的 verbatim 回填时会按课程展示对齐到 "light",届时再统一改。
//
// 本文件历史:s1 'Core components' / s2 'Installing deps' / s3 'Structuring' /
// s4 'Status bar style' 见 commit 6ee3fc1 / 7ff7a87 / 06cbe4c / 9ae5cf2;
// 'Routing' NativeRouter 见 f34de0c;本节起加入 ApolloProvider + createApolloClient。

import { ApolloProvider } from '@apollo/client/react';
import { StatusBar } from 'expo-status-bar';
import { NativeRouter } from 'react-router-native';

import Main from './src/components/Main';
import createApolloClient from './src/utils/apolloClient';

const apolloClient = createApolloClient();

const App = () => {
  return (
    <>
      <StatusBar style="auto" />
      <NativeRouter>
        <ApolloProvider client={apolloClient}>
          <Main />
        </ApolloProvider>
      </NativeRouter>
    </>
  );
};

export default App;

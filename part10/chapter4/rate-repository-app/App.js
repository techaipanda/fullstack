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
//  ← 已兑现:见下方 'Enhancing Apollo Client's requests' section marker,
//  本 commit 已把 StatusBar 改回 "light",chapter-4 后半部分三个 verbatim
//  展示现在一致。
//
// 本文件历史:s1 'Core components' / s2 'Installing deps' / s3 'Structuring' /
// s4 'Status bar style' 见 commit 6ee3fc1 / 7ff7a87 / 06cbe4c / 9ae5cf2;
// 'Routing' NativeRouter 见 f34de0c;'GraphQL and Apollo client' 加入
// ApolloProvider + createApolloClient (见 commit 7ccc8f2);
// 'Environment variables' 加 console.log 验证 .env 注入 (见 fc67152);
// 'Exercise 10.14' 建 authStorage 模板 (见 1b45015);
// 本节 'Enhancing Apollo Client's requests' 加 AuthStorage 注入。
//
// ---------- chapter4-Enhancing Apollo Client's requests ----------
// 改动(verbatim 高亮 7, 9-10):
//   + import AuthStorage from './src/utils/authStorage';
//   + const authStorage = new AuthStorage();
//   - const apolloClient = createApolloClient();
//   + const apolloClient = createApolloClient(authStorage);
//   - <StatusBar style="auto" />  (上一节 delta 保留的 chapter-3 末态)
//   + <StatusBar style="light" /> (MOOC 本节 verbatim 展示 — 见下方 ⚠)
// 为什么:createApolloClient 现在接 authStorage 参数,把存储实例
//  注入到 Apollo Link chain 里 (SetContextLink 调
//  authStorage.getAccessToken());new AuthStorage() 必须在模块级单例
//  (跟 apolloClient 一样放进 const,放进 App 函数会随 re-render 反复
//  new,丢失内部 namespace 状态)。
// ⚠ StatusBar style "auto" → "light" 是 MOOC 章节内部不一致的最终
//  对齐:chapter-3 'Routing' 改成 "auto",chapter-4 'GraphQL and
//  Apollo client' / 'Enhancing' / 'Context' 三处又都用 "light"。
//  之前 Environment variables 节保留 "auto" (chapter-3 末态),本节
//  verbatim 强制改 "light",兑现当时 header 里 "Enhancing verbatim
//  回填时会按课程展示对齐到 light,届时再统一改" 的伏笔。
// -------------------------------------------------------------------

import { ApolloProvider } from '@apollo/client/react';
import { StatusBar } from 'expo-status-bar';
import { NativeRouter } from 'react-router-native';

import Main from './src/components/Main';
import createApolloClient from './src/utils/apolloClient';
import AuthStorage from './src/utils/authStorage';

const authStorage = new AuthStorage();
const apolloClient = createApolloClient(authStorage);

const App = () => {
  console.log("env check:", process.env.EXPO_PUBLIC_ENV);

  return (
    <>
      <StatusBar style="light" />
      <NativeRouter>
        <ApolloProvider client={apolloClient}>
          <Main />
        </ApolloProvider>
      </NativeRouter>
    </>
  );
};

export default App;

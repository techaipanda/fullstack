// chapter4-GraphQL and Apollo client
// 改动:把 Apollo 客户端配置抽到独立文件,显式 new HttpLink({ uri })
//  作为网络层传给 ApolloClient.link;这一节只是占位,后面 "Enhancing
//  Apollo Client's requests" 会在 HttpLink 前 concat 一个 SetContextLink
//  注入 Authorization 头,useHttpLink 做底层 transport 才能让 SetContextLink
//  后接 httpLink 串联。
// 为什么:把 HTTP transport 显式抽成 HttpLink 对象,后续要拼中间件
//  (auth / retry / error link) 时直接 link.concat(authLink) 就行;
//  ApolloClient 构造里直接传 uri 字符串等于隐式走默认 HttpLink,
//  后期想插中间件得拆掉重写,代价高;提前显式化的扩展成本最低。
//
// ---------- chapter4-Enhancing Apollo Client's requests ----------
// 改动(verbatim 高亮 2, 8-30):
//   + import { SetContextLink } from '@apollo/client/link/context';
//   - uri: 'http://192.168.31.52:4000/graphql'
//   + uri: process.env.EXPO_PUBLIC_APOLLO_URI
//   - createApolloClient()
//   + createApolloClient(authStorage)
//     (新增 authLink: SetContextLink 读 authStorage.getAccessToken(),
//      非空时往请求头加 `authorization: Bearer <TOKEN>`,空时留空字符串)
//   - link: httpLink
//   + link: authLink.concat(httpLink)
//   - 删除 '// Replace the IP address...' 注释 (本节 URI 已切 env 变量)
// 为什么:每个 GraphQL 请求都要带 access token (后端从 Authorization
//  头解析用户身份);SetContextLink 是 Apollo 官方的 "中间件 link",
//  在请求发出前拦截上下文对象 ({ headers }) 并改写 headers;concat
//  顺序 authLink → httpLink 表示"先 authLink 加工头,再交给 httpLink
//  发出去";未登录时 accessToken 是 undefined (authStorage 模板方法
//  体空 — 见 Exercise 10.14 commit),authorization 留空字符串,
//  后端当未认证处理。
// ⚠ 副作用 — 同时做了 Exercise 10.12 的 URI 切换:本节 verbatim 直接
//  把硬编码 URI 换成 process.env.EXPO_PUBLIC_APOLLO_URI,Exercise 10.12
//  的 1:1 commit 因此被吞并 (.env 里已有 EXPO_PUBLIC_APOLLO_URI,
//  来自上一节 Environment variables,运行时行为不变)。
// -------------------------------------------------------------------

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

// ⭐ 核心概念: HttpLink = Apollo 客户端的 HTTP transport
// 不用 HttpLink (旧写法 ApolloClient({ uri })): 内部隐式 new HttpLink,
//  后面要加 auth link / retry link 时必须拆掉重构成 link.concat() 串联;
// 用 HttpLink: 网络层是一个有名字的对象,中间件按 link.concat(a).concat(b)
//  顺序串联,职责清晰且易扩展。
// 验证: Apollo DevTools → Apollo Client → "Cache" / "Link" 两个 tab,
//  Link tab 应显示当前 chain (这里只有 httpLink);加了 authLink 后
//  会变成 authLink → httpLink 的链。
// 关联: README 'GraphQL and Apollo client' 段。
// 增强: 本节把 uri 切到 process.env.EXPO_PUBLIC_APOLLO_URI,见 commit
//  fc67152 (Environment variables) 提前建好的 .env 文件。

const httpLink = new HttpLink({
  uri: process.env.EXPO_PUBLIC_APOLLO_URI,
});

const createApolloClient = (authStorage) => {
  const authLink = new SetContextLink(async ({ headers }) => {
    try {
      const accessToken = await authStorage.getAccessToken();
      return {
        headers: {
          ...headers,
          authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      };
    } catch (e) {
      console.log(e);
      return {
        headers,
      };
    }
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;

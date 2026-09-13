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

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

// ⭐ 核心概念: HttpLink = Apollo 客户端的 HTTP transport
// 不用 HttpLink (旧写法 ApolloClient({ uri })): 内部隐式 new HttpLink,
//  后面要加 auth link / retry link 时必须拆掉重构成 link.concat() 串联;
// 用 HttpLink: 网络层是一个有名字的对象,中间件按 link.concat(a).concat(b)
//  顺序串联,职责清晰且易扩展。
// 验证: Apollo DevTools → Apollo Client → "Cache" / "Link" 两个 tab,
//  Link tab 应显示当前 chain (这里只有 httpLink);加了 authLink 后
//  会变成 authLink → httpLink 的链。
// 关联: README 'GraphQL and Apollo client' 段。

// Replace the IP address part with your own IP address!
const httpLink = new HttpLink({
  uri: 'http://192.168.31.52:4000/graphql',
});

const createApolloClient = () => {
  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;

// chapter4-Exercise 10.11-fetching repositories with Apollo Client
// 改动:HTTP requests 节的 fetch + useState(useRepositories) 5 件套整体
//  替换为 useQuery(GET_REPOSITORIES, { fetchPolicy: 'cache-and-network' });
//  解构出 { data, loading, refetch };返回形状保持
//  { repositories, loading, refetch },repositories 直接挂
//  data?.repositories(含 edges / pageInfo 的 RepositoryConnection),
//  RepositoryList 现有的 repositories.edges.map(edge => edge.node) →
//  repositoryNodes 馈 FlatList 一行不动。
// 为什么:useQuery 内部接管了 fetch / loading / cache / 订阅卸载,只暴露
//  消费面 data/loading/error/refetch;cache-and-network 让首次进入
//  RepositoryList 时先返回 cache 里的旧数据同时拉新,避免列表空白闪烁
//  (network-only 会闪空白,cache-first 切回时仍只走 cache 不拉新)。
//
// 本文件历史:chapter4 'HTTP requests' sub-section (block 25) 用 fetch +
//  useState 抽出;本 Exercise 10.11 整体替换为 useQuery,遵循课程提示
//  「不会影响 RepositoryList」。

import { useQuery } from '@apollo/client/react';

import { GET_REPOSITORIES } from '../graphql/queries';

// ⭐ 核心概念: cache-and-network fetchPolicy
// 不用 cache-and-network (用默认 cache-first): 切回 RepositoryList 时
//  只读 cache,不重新发请求,数据可能跟服务端不一致 (其他客户端修改后
//  本地不会感知);首次进入时若 cache 空才会 network,UI 会先空白一下;
// 用 cache-and-network: 每次挂载都同时读 cache + 发请求,UI 立即渲染
//  旧数据不闪,然后新数据到达再覆盖,一致性 + 无闪烁兼顾。
// 验证: Apollo DevTools → Cache tab 看 repositories query 标记为
//  'active' 与 'cache-and-network';第二次进 RepositoryList 时 console
//  看 Apollo 会同时打 'cache-read' + 'network-fetch' 两条日志。
// 关联: README Exercise 10.11 段。

const useRepositories = () => {
  const { data, loading, refetch } = useQuery(GET_REPOSITORIES, {
    fetchPolicy: 'cache-and-network',
  });

  return { repositories: data?.repositories, loading, refetch };
};

export default useRepositories;

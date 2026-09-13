// chapter4-HTTP requests
// 改动:新增 src/hooks/useRepositories.js,封 useState (repositories /
//  loading) + useEffect ([]) + fetch + response.json 5 件套;返回值
// {repositories, loading, refetch: fetchRepositories}。
// 为什么:把网络请求细节 (URL / loading 切位 / 重抽) 从 RepositoryList
//  抽到自定义 hook,RepositoryList 只关心 repositoryNodes 派生;
//  refetch 返回 fetchRepositories 引用,让上层在不 unmount 的情况下
//  也能再次触发 fetch (后续 pull-to-refresh 用得到)。
//
// 本文件历史:chapter4 'HTTP requests' sub-section (course block 25)
//  verbatim 抽出;后续 'GraphQL and Apollo client' 会整体换 Apollo
//  useQuery hook,本 hook 被替换。

import { useState, useEffect } from 'react';

// ⭐ 核心概念: 自定义 hook 抽副作用
// React 自定义 hook 命名强制 useXxx,内部可调用其他 hook (useState /
// useEffect);外部组件调用 useRepositories() 就像调用普通 hook 一样
// 拿到 state + 副作用,无需感知 fetch URL / loading 切换逻辑。
// 验证: 看 React DevTools,RepositoryList 不会暴露 useState/useEffect,
// 只显示 useRepositories 的返回值。

const useRepositories = () => {
  const [repositories, setRepositories] = useState();
  const [loading, setLoading] = useState(false);

  const fetchRepositories = async () => {
    setLoading(true);

    // Replace the IP address part with your own IP address!
    const response = await fetch('http://192.168.31.52:5000/api/repositories');
    const json = await response.json();

    setLoading(false);
    setRepositories(json);
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  return { repositories, loading, refetch: fetchRepositories };
};

export default useRepositories;

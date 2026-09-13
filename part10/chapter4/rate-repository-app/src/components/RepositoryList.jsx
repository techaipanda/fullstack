// chapter4-HTTP requests
// 改动:删 hardcoded repositories 数组 + View.map() 渲染,改用
//  useRepositories hook 取真实 API + <FlatList data={repositoryNodes} />;
//  View import 换 FlatList;去掉 RepositoryItem import (本节 // Other
//  props 占位,后续 Exercise 11 加 renderItem 接入 RepositoryItem)。
// 为什么:FlatList 内置虚拟化,长列表只渲染可视区 item,免 .map()
//  一次全渲染 N 节点撑爆 native 视图层级;hook 让 RepositoryList
//  不感知 URL / loading,真正职责只剩"取 nodes → 喂 FlatList"。
//
// 本文件历史:s5 'Exercise 3.5 RepositoryList' hardcoded data 见
//  早期 commit;本节起改 API fetch + useRepositories hook + FlatList,
//  block 27 verbatim 复制。

import { FlatList } from 'react-native';

import useRepositories from '../hooks/useRepositories';

// ⭐ 核心概念: FlatList 虚拟化长列表
// 不用 FlatList (用 View.map()): 一次渲染全部 N 节点,每个节点是
//  真正的 native View,百级就撑爆 native 视图层级 / 内存;
// 用 FlatList: 只渲染可视区 + 上下少量 buffer (windowSize),滚动时
//  复用 unmounted item,O(1) 渲染开销与列表长度无关。
// 验证: data={1000 个 dummy item},Android Profiler 看 native view
// 树始终只 10-20 个 item view;React DevTools 树同理。
// 关联: README 段 22-26。

const RepositoryList = () => {
  const { repositories } = useRepositories();

  const repositoryNodes = repositories
    ? repositories.edges.map(edge => edge.node)
    : [];

  return (
    <FlatList
      data={repositoryNodes}
      // Other props
    />
  );
};

export default RepositoryList;

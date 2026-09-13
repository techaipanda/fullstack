// chapter4-Exercise 10.11-fetching repositories with Apollo Client
// 改动:补 FlatList 缺的两个 prop——renderItem={({ item }) =>
//  <RepositoryItem item={item} />} 把 useQuery 拿到的 node 喂给现成的
//  组件,keyExtractor={({ id }) => id} 给 FlatList 稳定 key(避免 data
//  更新时 React key 警告 + 帮 FlatList 复用 cell);ItemSeparator 用
//  View.height:10 做 item 间分隔。
// 为什么:chapter4 'HTTP requests' 节把 RepositoryList 改成 FlatList
//  时只放了 <FlatList data={repositoryNodes} // Other props>,renderItem
//  缺省时 FlatList 即使拿到 data 也只输出空容器(实际渲染 N 个无内容
//  item cell,这是 web 端 React DevTools 看到的 10 个空 div),数据
//  等于没渲染;RepositoryItem.jsx 早已写好,这里补上接线就闭环。
//
// 本文件历史:chapter4 'HTTP requests' sub-section 把 View.map() 改
//  FlatList 占位 // Other props;Exercise 10.11 补 renderItem 完成
//  数据 → UI 的最后一公里。

import { FlatList, View } from 'react-native';

import RepositoryItem from './RepositoryItem';
import useRepositories from '../hooks/useRepositories';

// ⭐ 核心概念: FlatList renderItem + keyExtractor 缺一不可
// 不用 renderItem (只传 data): FlatList 拿不到怎么画每个 item,只输出
//  空容器壳,N 个无内容 cell 渲染了但用户啥也看不见;
// 用 renderItem: 每行一个 React element,FlatList 内部虚拟化窗口只
//  mount 可视区 + 缓冲;keyExtractor 不给时 React 用数组 index 当 key,
//  增删 / 排序时整个列表被当成"换了全部 item",state 丢失 + warning。
// 验证: dev console 不再有 'Each child in a list should have a unique
//  key' 警告;FlatList 滚动时 React DevTools "highlight updates" 只
//  新增 cell 闪高亮,已有 cell 不重渲染。
// 关联: README Exercise 10.11 + 段 22-26。

const ItemSeparator = () => <View style={{ height: 10 }} />;

const RepositoryList = () => {
  const { repositories } = useRepositories();

  const repositoryNodes = repositories
    ? repositories.edges.map(edge => edge.node)
    : [];

  return (
    <FlatList
      data={repositoryNodes}
      ItemSeparatorComponent={ItemSeparator}
      renderItem={({ item }) => <RepositoryItem item={item} />}
      keyExtractor={({ id }) => id}
    />
  );
};

export default RepositoryList;

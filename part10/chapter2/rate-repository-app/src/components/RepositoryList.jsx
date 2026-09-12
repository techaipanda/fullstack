// chapter3-RepositoryList (Exercise 3.5)
// 改动:View 渲染 repositories 数组 (3 条 hardcoded sample),每条
//  <RepositoryItem item={item} />;默认导出。
// 为什么:本节无服务端数据,hardcode formik / react-async / react-native 3 条
//  走完样式演示;真实数据接入留 chapter 4+ GraphQL/REST;.map() 简化 3 条
//  渲染,长列表再换 FlatList。
//
// 课程原文定位:Exercise 3.5 'Polished reviewed repositories list' block 92
//  要求改 RepositoryItem 加 avatar + k-suffix + 整体美化;本文件是父容器,
//  被 Routing block 111 <Route path="/" element={<RepositoryList />} /> 引用。

import { View } from 'react-native';

import RepositoryItem from './RepositoryItem';

const repositories = [
  {
    id: 'jaredpalmer.formik',
    fullName: 'jaredpalmer/formik',
    description: 'Build forms in React, without the tears',
    language: 'TypeScript',
    stargazersCount: 21879,
    forksCount: 1799,
    reviewCount: 5,
    ratingAverage: 4.7,
    ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/4060187?v=4',
  },
  {
    id: 'async-library.react-async',
    fullName: 'async-library/react-async',
    description: 'Flexible promise-based React data loader',
    language: 'JavaScript',
    stargazersCount: 5264,
    forksCount: 308,
    reviewCount: 4,
    ratingAverage: 4.2,
    ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/5431097?v=4',
  },
  {
    id: 'facebook.react-native',
    fullName: 'facebook/react-native',
    description: 'A framework for building native apps with React',
    language: 'JavaScript',
    stargazersCount: 112000,
    forksCount: 23700,
    reviewCount: 6,
    ratingAverage: 4.6,
    ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
  },
];

const RepositoryList = () => {
  return (
    <View>
      {repositories.map((item) => (
        <RepositoryItem key={item.id} item={item} />
      ))}
    </View>
  );
};

export default RepositoryList;

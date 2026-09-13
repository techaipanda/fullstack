// chapter3-Routing
// 改动:加 import { Route, Routes, Navigate } from 'react-router-native';顶层
//  改 fragment 为 <View style={styles.container}>;在 <AppBar /> 下挂 <Routes>,
//  path="/ → <RepositoryList />,path="* → <Navigate to="/" replace /> 通配重定向;
//  新增 styles.container = { backgroundColor: theme.colors.mainBackground, flex: 1 }。
// 为什么:react-router-native 共享 react-router core,组件 API 完全一致,只是
//  history stack 不依赖 browser;Routes 内只渲染 path 匹配的第一条 Route,
//  catch-all <Route path="*"> 在列表末尾兜底未知路径;flex:1 让 View 撑满父级
//  (NativeRouter 提供的高度),backgroundColor 走 theme 命名空间便于统一调色。
//
// 本文件历史:s1 'Core components' / s3 'Structuring' / s4 'Status bar style'
// 见早期 commit;s4 起 Main.jsx 持有当前 sub-section demo,本节起改为路由容器;
//  Exercise 3.4 (AppBar) + 3.5 (RepositoryList) 同时回填,verbatim 依赖项到位。

import { StyleSheet, View } from 'react-native';
import { Route, Routes, Navigate } from 'react-router-native';

import RepositoryList from './RepositoryList';
import AppBar from './AppBar';
import theme from '../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.mainBackground,
    flex: 1,
  },
});

const Main = () => {
  return (
    <View style={styles.container}>
      <AppBar />
      <Routes>
        <Route path="/" element={<RepositoryList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </View>
  );
};

export default Main;

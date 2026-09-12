// chapter3-AppBar (Exercise 3.4)
// 改动:View 包 paddingTop=Constants.statusBarHeight + theme.colors.appBarBackground
//  背景,子节点挂 <AppBarTab />;默认导出。
// 为什么:Constants.statusBarHeight 留 OS 状态栏占位避免内容与时钟/电池图标
//  重叠;backgroundColor 走 theme 命名空间,改深灰一处生效;AppBarTab 拆分为
//  后续加 tab 留扩展点 (课程 block 91 提示 "good idea to separate into AppBarTab")。
//
// 课程原文定位:Exercise 3.4 'The app bar' block 86/89/91 容器骨架 + tab
// 文本 "Repositories" + Pressable + AppBarTab 拆分。

import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

import AppBarTab from './AppBarTab';
import theme from '../theme';

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    backgroundColor: theme.colors.appBarBackground,
  },
});

const AppBar = () => {
  return (
    <View style={styles.container}>
      <AppBarTab />
    </View>
  );
};

export default AppBar;

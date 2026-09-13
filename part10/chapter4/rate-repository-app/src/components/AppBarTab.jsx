// chapter3-AppBar (Exercise 3.4)
// 改动:Pressable 包 <Text style={{ color: '#fff' }}>Repositories</Text>;
//  默认导出。
// 为什么:Pressable 标记可点击区 (虽不接 onPress,符合 block 89 "don't have to
//  handle the onPress event in any way");style 覆盖 Text base color 避开
//  Text.jsx 缺 white variant 限制,不动 Text.jsx;独立组件便于加新 tab。
//
// 课程原文定位:Exercise 3.4 'The app bar' block 91 提示 "good idea might be
//  to separate the app bar's tab into a component like AppBarTab"。

import { Pressable, StyleSheet } from 'react-native';

import Text from './Text';

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

const AppBarTab = () => {
  return (
    <Pressable style={styles.container}>
      <Text style={{ color: '#fff' }}>Repositories</Text>
    </Pressable>
  );
};

export default AppBarTab;

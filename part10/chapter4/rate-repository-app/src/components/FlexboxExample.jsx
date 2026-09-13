// chapter3-Flexbox
// 改动:把课程 block 74 (FlexboxExample + flexDirection: 'row' 容器) + block 81
//  (FlexboxExample + flexGrow 0/1 项目) 两个独立教学示例 verbatim 合并到同一文件;
//  default export 是第一个示例,第二个示例改名为 FlexboxItemExample 作 named export;
//  原 {/* ... */} 占位换成 <Text> 描述以便 demo 可执行可见。
// 为什么:课程原文是 2 个独立示例 + 占位,落地到项目需要 default export 的演示
//  组件 + 在 App 上看到效果;命名调整是 single-file 双组件 + default export 场景的
//  最小必要修改,样式 key 名 (flexContainer / flexItemA / flexItemB) 原样保留。

import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'row',
  },
});

const itemStyles = StyleSheet.create({
  flexContainer: {
    display: 'flex',
  },
  flexItemA: {
    flexGrow: 0,
    backgroundColor: 'green',
  },
  flexItemB: {
    flexGrow: 1,
    backgroundColor: 'blue',
  },
});

const FlexboxExample = () => (
  <View style={styles.flexContainer}>
    <Text>Block 74 demo — flexDirection: row</Text>
  </View>
);

const FlexboxItemExample = () => (
  <View style={itemStyles.flexContainer}>
    <View style={itemStyles.flexItemA}>
      <Text>Flex item A</Text>
    </View>
    <View style={itemStyles.flexItemB}>
      <Text>Flex item B</Text>
    </View>
  </View>
);

export { FlexboxItemExample };
export default FlexboxExample;
// ============================================================
// chapter3 sub-section 3 'Structuring our project' — verbatim
// ============================================================
// 课程原话(verbatim):
//   "In the components directory create a file Main.jsx with the following content"
//   "Next, let's use the Main component in the App component in the App.js file
//    which is located in our project's root directory. Replace the current content
//    of the file with this"
//
// ⭐ 核心概念:为什么是 .jsx 而不是 .js?
//  课程在 part3 part5 用 .js,在 part10 React Native 切换 .jsx — 因为文件里包含
//   JSX 语法(<View><Text>...</Text></View>),.jsx 让编辑器/IDE 启用 JSX 语法高亮 +
//   Babel 转译优化
//  验证:把扩展名改回 .js,Metro bundler 仍能转译(JSX 是合法 JS),但 VS Code
//   会当作纯 JS,语法高亮和 IntelliSense 降级
//
// ⭐ 核心概念:为什么用 Constants.statusBarHeight 作为 marginTop?
//  不用 Constants.statusBarHeight:RN app 默认占据整个屏幕(包括 status bar 区域),
//   <View> 内容会从屏幕最顶端 (0,0) 开始绘制,被刘海/状态栏/时钟/电量图标遮挡
//  用 Constants.statusBarHeight:这个值是设备 status bar 的实际像素高度(iOS ≈ 44-47,
//   Android ≈ 24-30),作为 <View> 的 marginTop 让内容从 status bar 下方开始,避免遮挡
//  为什么不用 SafeAreaView?课程还没引入 react-native-safe-area-context,先用
//   Constants.statusBarHeight 简单方案。后续 sub-section 会教 SafeAreaView
//  验证:把 marginTop: Constants.statusBarHeight 改成 marginTop: 0,刷新 app
//   → "Rate Repository Application" 文字会被状态栏盖住一部分
//
// 注:下面 15 行代码完全 verbatim 自课程,只添加上方 JSDoc 注释 + 必要的 ⭐ 注解
//   (遵守 course-follow-official Step 4:只加 section marker + 中文学习注释)

import Constants from 'expo-constants';
import { Text, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
});

const Main = () => {
  return (
    <View style={styles.container}>
      <Text>Rate Repository Application</Text>
    </View>
  );
};

export default Main;
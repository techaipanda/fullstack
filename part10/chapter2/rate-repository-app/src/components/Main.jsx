// ============================================================
// chapter3 sub-section 6 'Style' — verbatim(块 51)
// ============================================================
// 课程原话(verbatim):
//   "In addition to an object, the style prop also accepts an array of objects.
//    In the case of an array, the objects are merged from left to right so that
//    latter-style properties take precedence. This works recursively, so we can
//    have for example an array containing an array of styles and so forth.
//    If an array contains values that evaluate to false, such as null or
//    undefined, these values are ignored. This makes it easy to define
//    conditional styles for example, based on the value of a prop."
//
// ⭐ 核心概念:camelCase + 无单位 — RN style 不是 CSS
//  CSS 写 padding-top: 20px;font-size: 24px;RN 写 paddingTop: 20;fontSize: 24
//   (数字无单位 — 代表 density-independent pixels,系统按屏幕 DPI 自动适配)
//  验证:把 fontSize: 24 改成 '24px' 字符串 → RN 运行时抛 "Invalid value for
//   style property fontSize: '24px' is not a number"
//  为什么:RN 不解析 CSS 单位字符串,直接用 number 做布局计算(性能 + 跨平台一致)
//   iOS/Android/Web(react-native-web) 各自把 dp 转成物理像素
//
// ⭐ 核心概念:为什么用 StyleSheet.create 而不是 inline 对象?
//  课程原话:"In general, defining styles directly in the style prop is not
//   considered such a great idea, because it makes components bloated and
//   unclear"
//  inline style={{...}}:每次 re-render 都新建对象 → StyleSheet 内部用数字 ID 缓存
//   失败,bridge/native 端要做新对比,性能差
//  StyleSheet.create(...):Metro 编译期把 {color: 'grey'} 编译成数字 ID 7,
//   native 端对比 O(1),跨 re-render 复用同一 native style
//  验证:在 styles.text 加 console.log(styles.text),每次 re-render 数字 ID
//   不变;而 inline {{ color: 'grey' }} 每次是新对象引用
//
// ⭐ 核心概念:`isBlue && styles.blueText` 短路求值做条件样式
//  JS 规则:true && X 永远返回 X;false && X 永远返回 false
//  RN 的 style 数组遇到 false/null/undefined 自动跳过(课程原话:"If an array
//   contains values that evaluate to false... these values are ignored")
//  验证:把 isBlue={false} → array 里第 2 项是 false → RN 跳过 → 只剩 styles.text
//  对比三目:isBlue ? styles.blueText : null 也可以,但更啰嗦
//
// ⭐ 核心概念:JSX 短语法 — `<FancyText isBlue>` 等价 `<FancyText isBlue={true}>`
//  课程原话:"In JSX, providing a prop without a value is special syntax that
//   means the same as ={true}"
//  验证:React devtools 看 props.isBlue,两种写法都显示 true
//  反例:不能写 `<FancyText isBlue=false>`(裸 JSX 标识符当值,布尔 false 不工作)
//   必须写 `<FancyText isBlue={false}>`
//
// ⚠️ 关于 sub-section 3 末态被覆盖的说明:
//  sub-section 3 末态 Main.jsx 有 marginTop: Constants.statusBarHeight +
//   "Rate Repository Application" 硬编码,本节 verbatim 把它们全部移除
//  这是课程设计:sub-section 3 只为教 expo-constants import 语法;sub-section 6
//   起专注 style 系统,后续 sub-section 7 (Theming) 会重新引入更完善的避让
//   方案 (SafeAreaView / theme 单位)
//
// 历史轨迹(已迁移到 git):
//  sub-section 3 (commit 06cbe4c):verbatim import Constants + 硬编码文字 "Rate Repository Application"

import { Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  text: {
    color: 'grey',
    fontSize: 14,
  },
  blueText: {
    color: 'blue',
  },
  bigText: {
    fontSize: 24,
    fontWeight: '700',
  },
});

const FancyText = ({ isBlue, isBig, children }) => {
  const textStyles = [
    styles.text,
    isBlue && styles.blueText,
    isBig && styles.bigText,
  ];

  return <Text style={textStyles}>{children}</Text>;
};

const Main = () => {
  return (
    <>
      <FancyText>Simple text</FancyText>
      <FancyText isBlue>Blue text</FancyText>
      <FancyText isBig>Big text</FancyText>
      <FancyText isBig isBlue>
        Big blue text
      </FancyText>
    </>
  );
};

export default Main;
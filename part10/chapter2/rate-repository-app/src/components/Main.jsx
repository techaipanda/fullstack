// chapter3-Style
// 改动:StyleSheet.create 把样式从 inline {{...}} 抽为编译期常量;
//  style prop 接 array + && 短路做条件样式合并 (FancyText isBlue/isBig)。
// 为什么:StyleSheet.create 编数字 ID,native 端跨 re-render 复用同一
//  style 引用,免 inline 每次新建对象的桥接对比;array + && 模式用声明式
//  表达"基础样式 + 条件覆盖",无需运行时分支判断。

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
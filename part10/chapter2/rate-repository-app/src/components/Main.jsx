// chapter3 sub-section 6 'Style' — verbatim course block 51.
// 改动:StyleSheet.create + array 合并 + && 短路做条件样式
// (FancyText isBlue/isBig)。为什么:演示 RN 标准 style 模式
// (StyleSheet 编译期编数字 ID,inline 每次新建对象,性能 + 复用)。
// 注:sub-section 3 的 Constants.statusBarHeight + "Rate Repository
// Application" 硬编码按课程末态移除,theming sub-section 会重建。

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
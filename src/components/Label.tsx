import React from "react";
import { Text, ViewStyle, TextStyle, StyleProp, View } from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";

type LabelSize = "small" | "normal" | "large";

interface Props {
  title: string;
  size: LabelSize;
  backgroundColor: string;
  textColor: string;
  labelStyle?: StyleProp<ViewStyle>;
  labelTextStyle?: StyleProp<TextStyle>;
}

export default function Label({
  title,
  size = "normal",
  labelStyle,
  labelTextStyle,
  backgroundColor,
  textColor,
}: Props) {
  const getLabelTextStyle = (): TextStyle => {
    return {
      ...GlobalStyles.labelTextBase,
      ...GlobalStyles[`label_text_${size}`],
    };
  };

  return (
    <View
      style={[
        GlobalStyles.labelBase,
        labelStyle,
        { backgroundColor: backgroundColor },
      ]}
    >
      <Text style={[getLabelTextStyle(), labelTextStyle, { color: textColor }]}>
        {title}
      </Text>
    </View>
  );
}

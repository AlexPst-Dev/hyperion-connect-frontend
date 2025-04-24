import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import GlobalStyles from "../styles/styles";

interface Props extends TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}

export default function AppText({ children, style, ...props }: Props) {
  return (
    <Text style={[GlobalStyles.p, style]} {...props}>
      {children}
    </Text>
  );
}

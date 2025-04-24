import React from "react";
import { Text, TextProps, TextStyle } from "react-native";

interface Props extends TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}

export default function AppText({ children, style, ...props }: Props) {
  return (
    <Text style={[{ fontFamily: "Roboto-Regular" }, style]} {...props}>
      {children}
    </Text>
  );
}

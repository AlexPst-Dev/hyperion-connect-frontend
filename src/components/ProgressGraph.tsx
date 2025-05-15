import React from "react";
import { Platform, View } from "react-native";
import AppText from "./AppText";
import GlobalStyles from "../styles/styles";

const isWeb = Platform.OS === "web";

type DataPoint = {
  month: string;
  value: number;
};

type Props = {
  title: string;
  data: DataPoint[];
};

export default function ProgressGraph({ title, data }: Props) {
  return (
    <View>
      <AppText style={GlobalStyles.h3}>{title}</AppText>
      // TODO : Find graph library
    </View>
  );
}

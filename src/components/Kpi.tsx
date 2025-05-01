import React from "react";
import { StyleSheet, View } from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon, { IconName } from "./Icon";
import AppText from "./AppText";

interface Props {
  title: string;
  iconName: IconName;
  value: string;
  unit?: string;
  fillIcon?: boolean;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    borderRadius: 4,
    padding: 8,
    backgroundColor: "white",
    borderColor: Colors.shadow,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    alignSelf: "flex-start",
    marginRight: 8,
    marginTop: 8,
  },
  header: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
  },
  title: {
    maxWidth: "70%",
    marginRight: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontWeight: "bold",
  },
  unit: {
    color: Colors.grey,
    marginLeft: 4,
  },
});

export default function Kpi({ title, iconName, value, unit, fillIcon }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText style={[GlobalStyles.span, styles.title]}>{title}</AppText>
        <View
          style={{
            flex: 1,
            width: "100%",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Icon
            name={iconName}
            width={16}
            height={16}
            fillColor={fillIcon ? Colors.deepBlue : "transparent"}
            strokeColor={Colors.deepBlue}
            strokeWidth={1}
          />
        </View>
      </View>
      <View style={styles.content}>
        <AppText style={[GlobalStyles.h2, styles.value]}>{value}</AppText>
        <AppText style={[GlobalStyles.span, styles.unit]}>{unit}</AppText>
      </View>
    </View>
  );
}

import React from "react";
import { View, StyleSheet } from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";
import AppText from "./AppText";
import Icon from "./Icon";

interface Props {
  duration: number;
  onGoingNumber: number;
  label: string;
}

function getGradientColor(index: number, total: number) {
  const start = { r: 30, g: 58, b: 138 }; // #1E3A8A
  const end = { r: 37, g: 99, b: 235 }; // #2563EB

  const ratio = index / (total - 1); // progress between 0 and 1
  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);

  return `rgb(${r}, ${g}, ${b})`;
}

export default function Objective({ duration, onGoingNumber, label }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.objectiveTitle}>
        <Icon
          name="objective"
          width={16}
          height={16}
          fillColor="transparent"
          strokeColor={Colors.grey}
          strokeWidth={2}
        />
        <AppText
          style={[
            GlobalStyles.span,
            { color: Colors.grey, marginBottom: 0, marginLeft: 4 },
          ]}
        >
          {label}
        </AppText>
      </View>
      <View style={styles.progression}>
        {Array.from({ length: duration }).map((_, index) => {
          const isFilled = index < onGoingNumber;
          const backgroundColor = isFilled
            ? getGradientColor(index, onGoingNumber)
            : "#D9D9D9";

          return (
            <View
              key={index}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                marginRight: 2,
                backgroundColor,
              }}
            />
          );
        })}
        <View style={styles.objectiveScore}>
          <Icon
            name="calendar"
            strokeColor={Colors.deepBlue}
            strokeWidth={1}
            fillColor="transparent"
            width={16}
            height={16}
          />
          <AppText style={styles.objectiveScoreTxt}>
            {onGoingNumber}/{duration}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  objectiveTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  progression: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,
  },
  objectiveScore: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
    backgroundColor: GlobalStyles.label_blue.backgroundColor,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  objectiveScoreTxt: {
    ...GlobalStyles.span,
    color: GlobalStyles.label_blue.color,
    marginLeft: 4,
    marginBottom: 0,
  },
});

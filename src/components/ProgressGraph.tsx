import React from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import AppText from "./AppText";
import GlobalStyles, { Colors } from "../styles/styles";

const screenWidth = Dimensions.get("window").width;

type DataPoint = {
  month: string;
  value: number;
};

type Props = {
  title: string;
  data: DataPoint[];
};

export default function ProgressGraph({ title, data }: Props) {
  const labels = data.map((point) => point.month);
  const values = data.map((point) => point.value);

  return (
    <View>
      <AppText
        style={[
          GlobalStyles.h3,
          { marginBottom: 16, textTransform: "uppercase" },
        ]}
      >
        {title}
      </AppText>
      <LineChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
        width={screenWidth}
        height={220}
        yAxisSuffix=""
        yAxisInterval={20}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 8,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: Colors.lightBlue,
          },
        }}
        bezier
        fromZero
        withInnerLines={false}
        yLabelsOffset={10}
        xLabelsOffset={-10}
        style={{
          borderRadius: 8,
          marginVertical: 8,
          alignSelf: "flex-end",
        }}
      />
    </View>
  );
}

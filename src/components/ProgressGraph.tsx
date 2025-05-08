import React from "react";
import { View, Text } from "react-native";
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from "victory";

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
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
        {title}
      </Text>

      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 20, y: 10 }}
      >
        <VictoryAxis tickValues={data.map((d) => d.month)} />
        <VictoryAxis
          dependentAxis
          domain={[0, 100]}
          tickValues={[0, 25, 50, 75, 100]}
          style={{
            tickLabels: { fontSize: 12 },
            grid: { stroke: "#e0e0e0", strokeDasharray: "4,4" },
          }}
        />
        <VictoryLine
          data={data}
          x="month"
          y="value"
          interpolation="monotoneX"
          style={{
            data: { stroke: "#007AFF", strokeWidth: 2 },
          }}
        />
      </VictoryChart>
    </View>
  );
}

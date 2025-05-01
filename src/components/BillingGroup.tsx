import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import AppText from "./AppText";
import Icon from "./Icon";
import GlobalStyles, { Colors } from "../styles/styles";

interface Props {
  billingLines?: React.ReactElement | React.ReactElement[];
  label: string;
  proFirstName: string;
  proLastName: string;
  sportsmanFirstName: string;
  sportsmanLastName: string;
  billingStartDate: Date;
  billingEndDate: Date;
  globalAmount: number;
}

export default function BillingGroup({
  billingLines,
  label,
  proFirstName,
  proLastName,
  sportsmanFirstName,
  sportsmanLastName,
  billingStartDate,
  billingEndDate,
  globalAmount,
}: Props) {
  const [billingLinesVisible, setBillingLinesVisible] = useState(false);

  const toggleBillingLines = () => {
    setBillingLinesVisible((prev) => !prev);
  };

  return (
    <View style={styles.groupContainer}>
      <Pressable onPress={toggleBillingLines} style={styles.headerContainer}>
        <View style={{ flex: 1 }}>
          <AppText style={[GlobalStyles.p, { fontWeight: "bold" }]}>
            {label}
          </AppText>
          <AppText>
            Intervenant : {proLastName} {proFirstName}
          </AppText>
          <AppText>
            Sportif : {sportsmanLastName} {sportsmanFirstName}
          </AppText>
          <AppText>
            Du {billingStartDate.toLocaleDateString("fr-FR")} au{" "}
            {billingEndDate.toLocaleDateString("fr-FR")}
          </AppText>
          <AppText>Montant global : {globalAmount} €</AppText>
        </View>
        <Icon
          name={billingLinesVisible ? "chevronUp" : "chevronDown"}
          width={24}
          height={24}
          strokeColor="#000"
          fillColor="transparent"
          strokeWidth={2}
        />
      </Pressable>

      {billingLinesVisible && billingLines && (
        <View style={styles.resultLines}>{billingLines}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    flexDirection: "column",
    gap: 8,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.shadow,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  resultLines: {
    flexDirection: "column",
    gap: 4,
  },
});

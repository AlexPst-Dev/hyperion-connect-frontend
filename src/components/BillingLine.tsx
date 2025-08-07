import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import AppText from "./AppText";
import GlobalStyles, { Colors } from "../styles/styles";
import AppButton from "./AppButton";
import Label from "./Label";

interface Props {
  amount: number;
  state: "received" | "pending";
  startDate: Date;
  endDate: Date;
  onBtnChangeStatePress?: () => void;
}

export default function BillingLine({
  amount,
  state,
  startDate,
  endDate,
  onBtnChangeStatePress,
}: Props) {
  const [billingState, setBillingState] = useState<"pending" | "received">(
    state
  );

  const handleChangeState = () => {
    setBillingState("received");
  };

  return (
    <View style={styles.lineContainer}>
      <View style={styles.header}>
        <AppText style={[GlobalStyles.p, { fontWeight: "bold" }]}>
          Facturation du {startDate.toLocaleDateString("fr-FR")} au{" "}
          {endDate.toLocaleDateString("fr-FR")}
        </AppText>
        <AppText>Montant : {amount} €</AppText>
      </View>

      <View style={styles.lineControllers}>
        <View style={{ alignSelf: "flex-end" }}>
          <Label
            title={
              billingState === "pending"
                ? "Paiement en attente"
                : "Paiement reçu"
            }
            backgroundColor={billingState === "pending" ? "#FFFAF4" : "#DEFFD6"}
            textColor={
              billingState === "pending" ? Colors.orange : Colors.green
            }
            size="small"
          />
        </View>
        {billingState === "pending" && (
          <View>
            <AppButton
              title="Marquer comme reçu"
              iconName="check"
              type="changeState"
              onPress={() => {
                if (onBtnChangeStatePress) onBtnChangeStatePress();
                handleChangeState();
              }}
              textStyle={{ fontSize: 12 }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lineContainer: {
    flexDirection: "column",
    gap: 16,
    backgroundColor: "#E2EBFF",
    borderRadius: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  header: {
    flexDirection: "column",
  },
  lineControllers: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 8,
  },
});

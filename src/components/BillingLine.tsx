import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import AppText from "./AppText";
import GlobalStyles from "../styles/styles";
import AppButton from "./AppButton";
import Label from "./Label";

interface Props {
  amount: number;
  state: "received" | "pending";
  startDate: Date;
  endDate: Date;
}

export default function BillingLine({
  amount,
  state,
  startDate,
  endDate,
}: Props) {
  const [billingState, setBillingState] = useState<"pending" | "received">(
    state
  );

  const handleChangeState = () => {
    setBillingState("received");
    console.log("État mis à jour à : reçu");
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
        {billingState === "pending" && (
          <View>
            <AppButton
              title="Marquer comme reçu"
              iconName="check"
              type="changeState"
              onPress={handleChangeState}
              textStyle={{ fontSize: 12 }}
            />
          </View>
        )}
        <View style={{ marginLeft: 12 }}>
          <Label
            title={
              billingState === "pending"
                ? "Paiement en attente"
                : "Paiement reçu"
            }
            type={billingState === "pending" ? "orange" : "green"}
            size="small"
          />
        </View>
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
  },
  header: {
    flexDirection: "column",
  },
  lineControllers: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});

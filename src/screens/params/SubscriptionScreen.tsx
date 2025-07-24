import AppText from "@/src/components/AppText";
import { useAuth } from "@/src/hooks/useAuth";
import { MonthlyMonitoringEnum, Subscription } from "@/src/models/subscription";
import { isSportsmanUser, SportsmanProfile } from "@/src/models/user";
import { fileService } from "@/src/services/api/file-service";
import { SubscriptionService } from "@/src/services/api/subscription-service";
import { UserService } from "@/src/services/api/user-service";
import GlobalStyles from "@/src/styles/styles";
import React, { useEffect, useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { File } from "@/src/models/file";
import ItemFile from "@/src/components/ItemFile";

export default function SubscriptionScreen() {
  const { user, token } = useAuth();

  const [subscriptionFile, setSubscriptionFile] = useState<File | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  async function fetchSubscriptionFileAndDetails() {
    if (!user || !token) {
      return;
    } else {
      const completeUser = await UserService.getUserById(user.id, token);
      if (isSportsmanUser(completeUser.user) && completeUser.profile) {
        const subscriptionId = (completeUser.profile as SportsmanProfile)
          .subscriptionId;
        if (subscriptionId) {
          try {
            const subscription =
              await new SubscriptionService().getSubscriptionByUserId(
                user.id,
                token
              );
            setSubscription(subscription);
            const subscriptionFile = await fileService.getFileById(
              subscription.subscriptionFileId,
              token
            );
            setSubscriptionFile(subscriptionFile);
          } catch (e) {
            console.error("Error fetching subscription file:", e);
            return;
          }
        }
      }
    }
  }

  useEffect(() => {
    fetchSubscriptionFileAndDetails();
  }, [user, token]);

  if (!user || !token) {
    return (
      <View style={GlobalStyles.pageStyle}>
        <AppText>Veuillez vous connecter pour voir votre abonnement.</AppText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
      style={GlobalStyles.pageStyle}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {subscription && (
          <>
            {subscriptionFile && (
              <>
                <AppText>
                  Vous pouvez télécharger votre abonnement ci-dessous :
                </AppText>
                <View style={{ marginVertical: 16 }}>
                  <ItemFile
                    file={subscriptionFile}
                    displayControllers={false}
                    token={token}
                    uploadToASpecificId={user.id}
                  />
                </View>
              </>
            )}
            <View style={{ flexDirection: "column", gap: 8 }}>
              <AppText>
                Vous pouvez voir ici les informations relatives à votre
                abonnement :
              </AppText>
              <AppText>{`Du ${subscription?.startDate} au ${subscription?.endDate}`}</AppText>
              {(subscription.monthlyMonitoringCategory ||
                subscription.otherServises) && (
                <>
                  <AppText>
                    -{" "}
                    {subscription.isBilanComplete
                      ? "Bilan physiologique général et prophylaxie"
                      : "Bilan physiologique sans prophylaxie"}
                  </AppText>
                  <AppText>
                    -{" "}
                    {subscription.monthlyMonitoringCategory ===
                    MonthlyMonitoringEnum.COMPLETE
                      ? "Suivi complet"
                      : subscription.monthlyMonitoringCategory ===
                        MonthlyMonitoringEnum.MENTAL_COACHING
                      ? "Suivi avec coaching mental"
                      : subscription.monthlyMonitoringCategory ===
                        MonthlyMonitoringEnum.DIETETIC
                      ? "Suivi avec diététique"
                      : "Aucun suivi mentionné"}
                  </AppText>
                  <AppText>
                    -{" "}
                    {subscription.otherServises !== ""
                      ? subscription.otherServises
                      : ""}
                  </AppText>
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

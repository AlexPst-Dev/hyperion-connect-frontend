import React, { JSX, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import AppText from "../components/AppText";
import GlobalStyles from "../styles/styles";
import ViewController from "../components/ViewController";
import Event from "../components/Event";
import { User } from "../context/AuthContext";
import Icon from "../components/Icon";
import ItemUser from "../components/ItemUser";

export default function HealthScreen() {
  const medicUser: User = {
    id: 1,
    firstName: "Sophie",
    lastName: "Lemoine",
    email: "s.l@mail.com",
    profileCategory: "medic",
  };

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabViews: JSX.Element[] = [
    <View style={{ flexDirection: "column", gap: 24 }}>
      <AppText>Préparez-vous pour vos prochains rendez-vous médicaux.</AppText>
      <Event
        type="medical"
        title="Analyse sanguine"
        personsInvolved={medicUser}
        location="Centre d'analyse de Vannes"
        date={new Date("2025-05-05")}
        hour="14h"
      />
      <Event
        type="medical"
        title="Analyse sanguine"
        personsInvolved={medicUser}
        location="Centre d'analyse de Vannes"
        date={new Date("2025-05-05")}
        hour="14h"
      />
      <AppText>
        Consultez vos rendez-vous précédents pour suivre votre historique.
      </AppText>
      <Event
        type="medical"
        title="Analyse sanguine"
        personsInvolved={medicUser}
        location="Centre d'analyse de Vannes"
        date={new Date("2025-05-05")}
        hour="14h"
      />
      <Event
        type="medical"
        title="Analyse sanguine"
        personsInvolved={medicUser}
        location="Centre d'analyse de Vannes"
        date={new Date("2025-05-05")}
        hour="14h"
      />
    </View>,
    <View style={{ flexDirection: "column", gap: 24 }}>
      <AppText style={{ fontWeight: "bold" }}>Notes médicales</AppText>
      <View
        style={{
          flexDirection: "column",
          gap: 8,
          paddingLeft: 16,
          borderLeftWidth: 4,
          borderLeftColor: "black",
        }}
      >
        <AppText style={{ fontWeight: "bold" }}>Entorse de la cheville</AppText>
        <AppText>12 décembre 2024</AppText>
        <AppText>
          Description : Entorse de la cheville gauche survenue lors d'un
          entraînement de course à pied. La blessure s'est produite après avoir
          trébuché sur une irrégularité du terrain.
        </AppText>
        <AppText>
          Temps de récupération : 4 semaines de repos et rééducation.
        </AppText>
        <AppText>
          Traitement suivi : Immobilisation partielle avec une attelle pendant 1
          semaine. Séances de kinésithérapie (2 fois par semaine pendant 3
          semaines). Exercices de renforcement musculaire et de proprioception.
          Application de glace et utilisation de bandages compressifs.
        </AppText>
      </View>
      <View style={{ flexDirection: "column", gap: 16 }}>
        <AppText style={GlobalStyles.h3}>Fichiers médicaux</AppText>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText>Résultats_Analyse_Sanguine_2025.pdf</AppText>
            <Icon
              name="download"
              width={24}
              height={24}
              strokeColor="black"
              fillColor="transparent"
              strokeWidth={2}
            />
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText>Compte_Rendu_IRM_Genou_2025.pdf</AppText>
            <Icon
              name="download"
              width={24}
              height={24}
              strokeColor="black"
              fillColor="transparent"
              strokeWidth={2}
            />
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText>Ordonnance_Kinésithérapie_2025.pdf</AppText>
            <Icon
              name="download"
              width={24}
              height={24}
              strokeColor="black"
              fillColor="transparent"
              strokeWidth={2}
            />
          </View>
        </View>
      </View>
    </View>,
    <View style={{ flexDirection: "column", gap: 24 }}>
      <AppText>
        Retrouvez ici la liste des intervenants médicaux avec qui vous avez eu
        au moins un rendez-vous.
      </AppText>
      <View style={{ flexDirection: "column", gap: 16 }}>
        <ItemUser
          firstName="Sophie"
          lastName="Lemoine"
          job="Médecin du sport"
          iconName="send"
          isCompany={false}
        />
        <ItemUser
          firstName="Sophie"
          lastName="Lemoine"
          job="Médecin du sport"
          iconName="send"
          isCompany={false}
        />
        <ItemUser
          firstName="Sophie"
          lastName="Lemoine"
          job="Médecin du sport"
          iconName="send"
          isCompany={false}
        />
      </View>
    </View>,
  ];

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
        <View style={{ flexDirection: "column", gap: 24 }}>
          <ViewController
            tabs={[
              { title: "Rendez-vous", icon: "calendar" },
              { title: "Suivi santé", icon: "hearth" },
              { title: "Soignants", icon: "medic" },
            ]}
            onTabChange={setActiveTabIndex}
          />
          {tabViews[activeTabIndex]}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import AppText from "../components/AppText";
import ViewController, {
  ViewControllerTab,
} from "../components/ViewController";
import ItemUser from "../components/ItemUser";
import { IconName } from "../components/Icon";
import Input from "../components/Input";
import AppButton from "../components/AppButton";
import AddContacts from "../components/popups/AddContacts";
import { User } from "../context/AuthContext";
import UserCard from "../components/UserCard";
import GlobalStyles from "../styles/styles";
import BillingGroup from "../components/BillingGroup";
import BillingLine from "../components/BillingLine";
import Objective from "../components/Objective";

export default function UsersScreen() {
  const [currentTab, setCurrentTab] = useState(0);
  const [popupAddContactVisible, setPopupAddContactVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const tabs: ViewControllerTab[] = [
    { title: "Sportifs", icon: "medal" },
    { title: "Coachs", icon: "dumbell" },
    { title: "Soignants", icon: "medic" },
  ];

  const users: User[] = [
    {
      id: 1,
      firstName: "Alex",
      lastName: "Martin",
      email: "alex.martin@mail.com",
      profileCategory: "coach",
    },
    {
      id: 2,
      firstName: "Sophie",
      lastName: "Lemoine",
      email: "sophie.lemoine@mail.com",
      profileCategory: "medic",
    },
    {
      id: 3,
      firstName: "Chloé",
      lastName: "Arthur",
      email: "chloe.arthur@mail.com",
      profileCategory: "partner",
    },
  ];

  const sportsmans = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      sport: "Running",
      iconName: "send" as IconName,
      isCompany: false,
    },
    {
      id: "2",
      firstName: "Doe",
      lastName: "John",
      sport: "Running",
      iconName: "send" as IconName,
      isCompany: false,
    },
  ];

  const sportsmanContent = () => {
    return (
      <>
        <View style={{ flexDirection: "column", marginBottom: 24 }}>
          <Input
            type="text"
            label="Rechercher"
            placeholder="nom, prenom, email..."
          />
          <Input
            type="multiSelector"
            label="Filtrer"
            placeholder="Running, paiements en attente"
            value={selectedFilters}
            onChangeText={(value) => {
              setSelectedFilters(value.split(",").filter((v) => v));
            }}
            options={[
              {
                label: "Running",
                value: "running",
              },
              {
                label: "Natation",
                value: "natation",
              },
              {
                label: "Cyclisme",
                value: "cyclisme",
              },
              {
                label: "Tir à l'arc",
                value: "archery",
              },
            ]}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          {sportsmans.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <View style={{ height: 12 }} />}
              <ItemUser
                isCompany={item.isCompany}
                firstName={item.firstName}
                lastName={item.lastName}
                sport={item.sport}
                iconName={item.iconName}
              />
            </React.Fragment>
          ))}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <AppButton
            type="add"
            iconName="plus"
            onPress={() => setPopupAddContactVisible(true)}
          />
        </View>
      </>
    );
  };

  const coachContent = () => {
    return (
      <>
        <UserCard
          detailled
          canBeContacted
          firstName="John"
          lastName="Doe"
          susbcriptionLabel="Gold"
          sport="Running"
          phone="0606060606"
          email="john.doe@mail.com"
          age="23"
        />
        <View style={{ flexDirection: "column", gap: 16, marginTop: 24 }}>
          <AppText style={GlobalStyles.h2}>PRESTATION & ECHEANCES</AppText>
          <Objective
            duration={10}
            onGoingNumber={4}
            label="Suivi par un coach sportif de running"
          />
        </View>
      </>
    );
  };

  const medicContent = () => {
    const billingLines = (
      <>
        <BillingLine
          amount={500}
          state="pending"
          startDate={new Date("2025-04-05")}
          endDate={new Date("2025-05-05")}
        />
        <BillingLine
          amount={500}
          state="received"
          startDate={new Date("2025-03-05")}
          endDate={new Date("2025-04-05")}
        />
        <BillingLine
          amount={500}
          state="received"
          startDate={new Date("2025-02-05")}
          endDate={new Date("2025-03-05")}
        />
      </>
    );
    return (
      <>
        <AppText style={GlobalStyles.h2}>FACTURATION</AppText>
        <View style={{ marginTop: 24 }}>
          <BillingGroup
            billingLines={billingLines}
            label="Suivi par un coach sportif de running"
            proFirstName="Alex"
            proLastName="Martin"
            sportsmanFirstName="John"
            sportsmanLastName="Doe"
            billingStartDate={new Date("2025-02-05")}
            billingEndDate={new Date("2025-10-05")}
            globalAmount={4500}
          />
        </View>
      </>
    );
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <View>{sportsmanContent()}</View>;
      case 1:
        return <View>{coachContent()}</View>;
      case 2:
        return <View>{medicContent()}</View>;
      default:
        return null;
    }
  };

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
        <View style={{ marginBottom: 24 }}>
          <ViewController tabs={tabs} onTabChange={setCurrentTab} />
        </View>

        <View>{renderTabContent()}</View>
      </ScrollView>
      {popupAddContactVisible && (
        <AddContacts
          listOfUser={users}
          visible={popupAddContactVisible}
          onClose={() => setPopupAddContactVisible(false)}
          onSubmit={() => setPopupAddContactVisible(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

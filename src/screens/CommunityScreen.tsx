import React, { JSX, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import AppText from "../components/AppText";
import GlobalStyles from "../styles/styles";
import { User } from "../context/AuthContext";
import ViewController from "../components/ViewController";
import Event from "../components/Event";
import AddContacts from "../components/popups/AddContacts";
import { useAuth } from "../hooks/useAuth";
import AppButton from "../components/AppButton";
import PopUp from "../components/PopUp";
import Input from "../components/Input";
import DisplayEvent from "../components/popups/DisplayEvent";
import ItemUser from "../components/ItemUser";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

export default function CommunityScreen() {
  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "ContactDetail"
  >;
  const navigation = useNavigation<NavigationProp>();

  const tempAdminUser: User = {
    id: 1,
    firstName: "Chloé",
    lastName: "Marchegay",
    email: "chloe.marchegay@hyperion.com",
    profileCategory: "admin",
  };

  type EventType = {
    title: string;
    type: "medical" | "hyperlink" | "hyperion" | "session" | "sportingActivity";
    personsInvolved: User;
    location: string;
    date: Date;
    hour: string;
    infoDescription: string;
    theme?: string;
    link?: string;
  };

  const listOfContactUsers: User[] = [
    {
      id: 1,
      firstName: "Chloé",
      lastName: "Marchegay",
      email: "chloe.marchegay@hyperion.com",
      profileCategory: "admin",
    },
    {
      id: 2,
      firstName: "Alexa",
      lastName: "Amazone",
      email: "a.a@exemple.com",
      profileCategory: "sportsman",
    },
    {
      id: 3,
      firstName: "Danny",
      lastName: "Dan",
      email: "d.d@exemple.com",
      profileCategory: "sportsman",
    },
    {
      id: 4,
      firstName: "Marc",
      lastName: "Cram",
      email: "m.c@exemple.com",
      profileCategory: "coach",
    },
    {
      id: 5,
      firstName: "Doke",
      lastName: "Theurc",
      email: "d.tc@exemple.com",
      profileCategory: "medic",
    },
  ];

  type CommunityPageRenderer = (user: User) => JSX.Element;

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [addContactPopUpVisible, setAddContactPopUpVisible] = useState(false);
  const [eventDetailVisible, setDisplayEvent] = useState<EventType | false>(
    false
  );
  const [
    editSportingActivityPopUpVisible,
    setEditSportingActivityPopUpVisible,
  ] = useState(false);

  const { user } = useAuth();

  if (!user) return null;

  const displayAddContactPopUp = () =>
    setAddContactPopUpVisible(!addContactPopUpVisible);

  const displayEventDetailPopup = (event?: EventType) =>
    setDisplayEvent(event ? event : false);

  const handleEditSportingActivityPopUp = () =>
    setEditSportingActivityPopUpVisible(!editSportingActivityPopUpVisible);

  const tabViews: JSX.Element[] = [
    // Tab 0 : Sportsman
    <View key="sportsmans" style={{ flexDirection: "column", gap: 24 }}></View>,

    // Tab 1 : Coachs
    <View key="coaches" style={{ flexDirection: "column", gap: 24 }}></View>,

    // Tab 2 : Medic
    <View key="medics" style={{ flexDirection: "column", gap: 24 }}></View>,
  ];

  const CommunityPageByProfile: Record<string, CommunityPageRenderer> = {
    sportsman: (user) => {
      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>PROCHAINS EVENEMENTS</AppText>
              <Event
                title="Evénement Hyperion Vannes"
                type="hyperion"
                personsInvolved={tempAdminUser}
                location="Parc de Vannes"
                date={new Date("2025-10-10")}
                hour="14h00"
              />
              <Event
                title="Evénement Hyperion Vannes"
                type="hyperion"
                personsInvolved={tempAdminUser}
                location="Parc de Vannes"
                date={new Date("2025-10-10")}
                hour="14h00"
              />
            </View>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>ACTIVITES PROPOSEES</AppText>
              <Event
                title="Sortie running Vannes 10km"
                type="sportingActivity"
                personsInvolved={tempAdminUser}
                location="Parc de Vannes"
                date={new Date("2025-10-10")}
                hour="14h00"
                infoDescription="Lorem ipsum dolore sit amet"
                onPress={() =>
                  displayEventDetailPopup({
                    title: "Sortie running Vannes 10km",
                    type: "sportingActivity",
                    personsInvolved: tempAdminUser,
                    location: "Parc de Vannes",
                    date: new Date("2025-10-10"),
                    hour: "14h00",
                    infoDescription: "Lorem ipsum dolore sit amet",
                  })
                }
              />
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <AppButton
                  type="primary"
                  title="Proposer une activité"
                  iconName="plus"
                  onPress={handleEditSportingActivityPopUp}
                />
              </View>
            </View>
          </View>
          <Modal
            visible={editSportingActivityPopUpVisible}
            transparent
            onRequestClose={handleEditSportingActivityPopUp}
          >
            <Pressable
              onPress={handleEditSportingActivityPopUp}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <PopUp
                title="Editer une sortie sportive"
                onClose={handleEditSportingActivityPopUp}
                closeText="Annuler"
                onSubmit={handleEditSportingActivityPopUp}
                btnText="Valider"
                btnType="primary"
                iconName="check"
                inputs={
                  <>
                    <Input
                      type="text"
                      label="Nom"
                      placeholder="Nom de l'évenement"
                    />
                    <Input type="text" label="Lieu" placeholder="Adresse" />
                    <Input
                      type="text"
                      label="Lien utile"
                      placeholder="https://"
                    />
                    <Input
                      type="text"
                      label="Heure de début"
                      placeholder="08:00"
                    />
                    <Input
                      type="text"
                      label="Heure de fin"
                      placeholder="09:00"
                    />
                    <Input type="date" label="Date" placeholder="XX/XX/XXXX" />
                    <Input
                      type="number"
                      label="Nombre de personnes"
                      placeholder="10"
                    />
                    <Input
                      type="textarea"
                      label="Description"
                      placeholder="Décrivez l'activité proposée ici..."
                    />
                  </>
                }
              />
            </Pressable>
          </Modal>
        </>
      );
    },
    coach: (user) => <></>,
    medic: (user) => <></>,
    free: (user) => <></>,
    partner: (user) => <></>,
    admin: (user) => <></>,
  };

  const RenderProfileComponents = CommunityPageByProfile[user.profileCategory];

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
              { title: "Sportifs", icon: "medal" },
              { title: "Coachs", icon: "dumbell" },
              { title: "Soignants", icon: "medic" },
            ]}
            onTabChange={setActiveTabIndex}
          />
          {tabViews[activeTabIndex]}

          <View style={{ flex: 1 }}>
            <ScrollView
              style={{
                height: 300,
              }}
              scrollEnabled
              nestedScrollEnabled={true}
            >
              <View
                style={{
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {listOfContactUsers.map((user) => (
                  <Pressable
                    onPress={() => {
                      navigation.navigate("ContactDetail", { contact: user });
                    }}
                    key={user.id}
                  >
                    <ItemUser
                      key={user.id}
                      firstName={user.firstName}
                      lastName={user.lastName}
                      isCompany={false}
                      iconName="send"
                    />
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <AppButton
              type="add"
              iconName="plus"
              onPress={displayAddContactPopUp}
            />
          </View>

          {RenderProfileComponents ? RenderProfileComponents(user) : null}
        </View>
        {addContactPopUpVisible && (
          <AddContacts
            visible={addContactPopUpVisible}
            listOfUser={[tempAdminUser]}
            onClose={displayAddContactPopUp}
          />
        )}
        {eventDetailVisible && (
          <DisplayEvent
            visible={!!eventDetailVisible}
            userConnected={1}
            listOfUser={[eventDetailVisible.personsInvolved]}
            onClose={() => displayEventDetailPopup()}
            title={eventDetailVisible.title}
            eventType={eventDetailVisible.type}
            location={eventDetailVisible.location}
            date={eventDetailVisible.date}
            hour={eventDetailVisible.hour}
            theme={eventDetailVisible?.theme}
            link={eventDetailVisible?.link}
            infoDescription={eventDetailVisible.infoDescription}
            createdBy={eventDetailVisible.personsInvolved.id}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

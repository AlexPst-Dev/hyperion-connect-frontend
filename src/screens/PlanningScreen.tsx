import React, { JSX, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";
import AppText from "../components/AppText";
import Event from "../components/Event";
import { ProfileCategory, User } from "../models/user";
import { useAuth } from "../hooks/useAuth";
import AppButton from "../components/AppButton";
import PopUp from "../components/PopUp";
import Input from "../components/Input";
import AddContacts from "../components/popups/AddContacts";
import DisplayEvent from "../components/popups/DisplayEvent";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import { RootStackParamList } from "../navigation/types";
import ViewController from "../components/ViewController";
import { LoggedUser } from "../models/auth";

export default function PlanningScreen() {
  type PlanningPageRenderer = (user: LoggedUser) => JSX.Element;
  const { token } = useAuth();

  const tempAdminUser: User = {
    id: 1,
    firstName: "Chloé",
    lastName: "Marchegay",
    email: "chloe.marchegay@hyperion.com",
    profileCategory: ProfileCategory.ADMIN,
    isActive: true,
    createdAt: "2025-05-05",
    updatedAt: "2025-05-05",
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

  const PlanningPageByProfile: Record<string, PlanningPageRenderer> = {
    sportsman: (user) => <></>,
    coach: (user) => {
      const [activeTabIndex, setActiveTabIndex] = useState(0);
      type NavigationProp = NativeStackNavigationProp<
        RootStackParamList,
        "PlanningHistory"
      >;
      const navigation = useNavigation<NavigationProp>();

      const [editEventPopUpVisible, setEditEventPopUpVisible] = useState(false);

      const [addContactPopUpVisible, setAddContactPopUpVisible] =
        useState(false);

      const displayAddContactPopUp = () =>
        setAddContactPopUpVisible(!addContactPopUpVisible);

      const handleEditEventModal = () =>
        setEditEventPopUpVisible(!editEventPopUpVisible);

      const tabViews: JSX.Element[] = [
        // Tab 0 : Rendez-vous
        <View key="meetings" style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>PROCHAINS RENDEZ-VOUS</AppText>
          <AppText>
            Préparez-vous pour vos prochains rendez-vous sportifs.
          </AppText>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <AppButton
              type="linkNormal"
              title="Voir historique"
              iconName="eye"
              onPress={() => {
                navigation.navigate("PlanningHistory");
              }}
            />
          </View>
          <Event
            title="Séance de fractionné"
            personsInvolved={tempAdminUser}
            location="Parc de Vannes"
            date={new Date("2025-10-10")}
            isInPerson
            hour="14h00"
            type="session"
          />
          <Event
            title="Séance de fractionné"
            personsInvolved={tempAdminUser}
            location="Parc de Vannes"
            date={new Date("2025-10-10")}
            isInPerson
            hour="14h00"
            type="session"
          />
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <AppButton
              type="add"
              iconName="plus"
              onPress={handleEditEventModal}
            />
          </View>
        </View>,

        // Tab 1 : Evenements
        <View key="events" style={{ flexDirection: "column", gap: 16 }}>
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
        </View>,
      ];

      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <ViewController
              tabs={[
                { title: "Seances", icon: "dumbell" },
                { title: "Evenements", icon: "calendar" },
              ]}
              onTabChange={setActiveTabIndex}
            />
            {tabViews[activeTabIndex]}
          </View>
          <Modal
            visible={editEventPopUpVisible}
            transparent
            onRequestClose={handleEditEventModal}
          >
            <Pressable
              onPress={handleEditEventModal}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <PopUp
                title="Editer un rendez-vous"
                onClose={handleEditEventModal}
                closeText="Annuler"
                btnText="Editer"
                btnType="primary"
                iconName="pencil"
                onSubmit={handleEditEventModal}
                inputs={
                  <>
                    <Input
                      type="text"
                      label="Libellé du rendez-vous"
                      placeholder="Libellé du rendez-vous"
                    />
                    <Input type="text" label="Lieu" placeholder="Adresse" />
                    <Input type="date" label="Date" placeholder="XX/XX/XXXX" />
                    <Input type="text" label="Heure" placeholder="08h00" />
                    <Pressable
                      onPress={() => displayAddContactPopUp()}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors.deepBlue,
                        marginTop: 8,
                      }}
                    >
                      <AppText style={{ color: Colors.grey }}>
                        Selectionnez une personne à ajouter au rendez-vous
                      </AppText>
                    </Pressable>
                  </>
                }
              />
            </Pressable>
          </Modal>
          {addContactPopUpVisible && (
            <AddContacts
              visible={addContactPopUpVisible}
              token={token ? token : ""}
              onClose={displayAddContactPopUp}
            />
          )}
        </>
      );
    },
    medic: (user) => {
      const [activeTabIndex, setActiveTabIndex] = useState(0);
      type NavigationProp = NativeStackNavigationProp<
        RootStackParamList,
        "PlanningHistory"
      >;
      const navigation = useNavigation<NavigationProp>();

      const [editEventPopUpVisible, setEditEventPopUpVisible] = useState(false);

      const [addContactPopUpVisible, setAddContactPopUpVisible] =
        useState(false);

      const displayAddContactPopUp = () =>
        setAddContactPopUpVisible(!addContactPopUpVisible);

      const handleEditEventModal = () =>
        setEditEventPopUpVisible(!editEventPopUpVisible);

      const tabViews: JSX.Element[] = [
        // Tab 0 : Rendez-vous
        <View key="meetings" style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>PROCHAINS RENDEZ-VOUS</AppText>
          <AppText>
            Préparez-vous pour vos prochains rendez-vous médicaux.
          </AppText>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <AppButton
              type="linkNormal"
              title="Voir historique"
              iconName="eye"
              onPress={() => {
                navigation.navigate("PlanningHistory");
              }}
            />
          </View>
          <Event
            title="Analyse sanguine"
            personsInvolved={tempAdminUser}
            location="Parc de Vannes"
            date={new Date("2025-10-10")}
            isInPerson
            hour="14h00"
            type="medical"
          />
          <Event
            title="Bilan cardiovasculaire"
            personsInvolved={tempAdminUser}
            location="Parc de Vannes"
            date={new Date("2025-10-10")}
            isInPerson
            hour="14h00"
            type="session"
          />
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <AppButton
              type="add"
              iconName="plus"
              onPress={handleEditEventModal}
            />
          </View>
        </View>,

        // Tab 1 : Evenements
        <View key="seances" style={{ flexDirection: "column", gap: 16 }}>
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
        </View>,
      ];

      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <ViewController
              tabs={[
                { title: "RENDEZ-VOUS", icon: "medic" },
                { title: "EVENEMENTS", icon: "calendar" },
              ]}
              onTabChange={setActiveTabIndex}
            />
            {tabViews[activeTabIndex]}
          </View>
          <Modal
            visible={editEventPopUpVisible}
            transparent
            onRequestClose={handleEditEventModal}
          >
            <Pressable
              onPress={handleEditEventModal}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <PopUp
                title="Editer un rendez-vous"
                onClose={handleEditEventModal}
                closeText="Annuler"
                btnText="Editer"
                btnType="primary"
                iconName="pencil"
                onSubmit={handleEditEventModal}
                inputs={
                  <>
                    <Input
                      type="text"
                      label="Libellé du rendez-vous"
                      placeholder="Libellé du rendez-vous"
                    />
                    <Input type="text" label="Lieu" placeholder="Adresse" />
                    <Input type="date" label="Date" placeholder="XX/XX/XXXX" />
                    <Input type="text" label="Heure" placeholder="08h00" />
                    <Pressable
                      onPress={() => displayAddContactPopUp()}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors.deepBlue,
                        marginTop: 8,
                      }}
                    >
                      <AppText style={{ color: Colors.grey }}>
                        Selectionnez une personne à ajouter au rendez-vous
                      </AppText>
                    </Pressable>
                  </>
                }
              />
            </Pressable>
          </Modal>
          {addContactPopUpVisible && (
            <AddContacts
              visible={addContactPopUpVisible}
              token={token ? token : ""}
              onClose={displayAddContactPopUp}
            />
          )}
        </>
      );
    },
    free: (user) => {
      return (
        <>
          <View style={{ flexDirection: "column", gap: 32 }}>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>EVENEMENTS HYPERION</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
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
            </View>
          </View>
        </>
      );
    },
    partner: (user) => {
      const [eventTypeLabel, setEventTypeLabel] = useState("");

      const [eventDetailVisible, setDisplayEvent] = useState<EventType | false>(
        false
      );

      const displayEventDetailPopup = (event?: EventType) =>
        setDisplayEvent(event ? event : false);

      return (
        <>
          <View style={{ flexDirection: "column", gap: 32 }}>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>RENDEZ-VOUS HYPERLINK</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <Event
                  title="Evénement Hyperlink Vannes"
                  type="hyperlink"
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                  infoDescription="Lorem ipsum dolore sit amet"
                  theme="Soiree de lancement"
                  onPress={() =>
                    displayEventDetailPopup({
                      title: "Evénement Hyperlink Vannes",
                      type: "hyperlink",
                      personsInvolved: tempAdminUser,
                      location: "Parc de Vannes",
                      date: new Date("2025-10-10"),
                      hour: "14h00",
                      infoDescription: "Lorem ipsum dolore sit amet",
                      theme: "Soiree de lancement",
                    })
                  }
                />
                <Event
                  title="Evénement Hyperlink Vannes"
                  type="hyperlink"
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                />
                <Event
                  title="Evénement Hyperlink Vannes"
                  type="hyperlink"
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                />
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>EVENEMENTS HYPERION</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
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
            </View>
          </View>
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
        </>
      );
    },
    admin: (user) => {
      const [editEventPopUpVisible, setEditEventPopUpVisible] = useState(false);
      const [eventTypeLabel, setEventTypeLabel] = useState("");

      const [addContactPopUpVisible, setAddContactPopUpVisible] =
        useState(false);

      const [eventDetailVisible, setDisplayEvent] = useState<EventType | false>(
        false
      );

      const handleEditEventModal = () =>
        setEditEventPopUpVisible(!editEventPopUpVisible);
      const displayAddContactPopUp = () =>
        setAddContactPopUpVisible(!addContactPopUpVisible);
      const displayEventDetailPopup = (event?: EventType) =>
        setDisplayEvent(event ? event : false);

      const [selectedUsers, setSelectedUser] = useState<User[] | []>([]);

      const handleAddContactsSubmit = (selectedUsers: User[]) => {
        console.log("Selected users:", selectedUsers);
        setSelectedUser(selectedUsers);
        setAddContactPopUpVisible(false);
      };

      return (
        <>
          <View style={{ flexDirection: "column", gap: 32 }}>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>RENDEZ-VOUS HYPERLINK</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <Event
                  title="Evénement Hyperlink Vannes"
                  type="hyperlink"
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                  infoDescription="Lorem ipsum dolore sit amet"
                  theme="Soiree de lancement"
                  onPress={() =>
                    displayEventDetailPopup({
                      title: "Evénement Hyperlink Vannes",
                      type: "hyperlink",
                      personsInvolved: tempAdminUser,
                      location: "Parc de Vannes",
                      date: new Date("2025-10-10"),
                      hour: "14h00",
                      infoDescription: "Lorem ipsum dolore sit amet",
                      theme: "Soiree de lancement",
                    })
                  }
                />
                <Event
                  title="Evénement Hyperlink Vannes"
                  type="hyperlink"
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                />
                <Event
                  title="Evénement Hyperlink Vannes"
                  type="hyperlink"
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                />
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <AppButton
                    type="add"
                    iconName="plus"
                    onPress={() => {
                      setEventTypeLabel("hyperlink");
                      handleEditEventModal();
                    }}
                  />
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>EVENEMENTS HYPERION</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
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
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <AppButton
                    type="add"
                    iconName="plus"
                    onPress={() => {
                      setEventTypeLabel("hyperion");
                      handleEditEventModal();
                    }}
                  />
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>
                SORTIES SPORTIVES A VALIDER
              </AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
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
                      link: "https://strava.com/ferzfbeyzugfeyuz",
                    })
                  }
                />
              </View>
            </View>
          </View>
          <Modal
            visible={editEventPopUpVisible}
            transparent
            onRequestClose={handleEditEventModal}
          >
            <Pressable
              onPress={handleEditEventModal}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <PopUp
                title={"Editer un évenement " + eventTypeLabel}
                onClose={handleEditEventModal}
                closeText="Annuler"
                inputs={
                  <>
                    <Input
                      type="text"
                      label="Nom"
                      placeholder="Nom de l'événement"
                    />
                    <Input type="text" label="Lieu" placeholder="Adresse" />
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
                    <Pressable
                      onPress={() => displayAddContactPopUp()}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors.deepBlue,
                        marginTop: 8,
                      }}
                    >
                      {selectedUsers.length !== 0 ? (
                        selectedUsers.map((user) => (
                          <AppText key={user.id}>
                            {user.firstName} {user.lastName}
                          </AppText>
                        ))
                      ) : (
                        <AppText style={{ color: Colors.grey }}>
                          Selectionnez une personne à ajouter à l'évenement
                        </AppText>
                      )}
                    </Pressable>
                  </>
                }
              />
            </Pressable>
          </Modal>
          {addContactPopUpVisible && (
            <AddContacts
              visible={addContactPopUpVisible}
              token={token ? token : ""}
              onClose={displayAddContactPopUp}
              onSubmit={handleAddContactsSubmit}
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
        </>
      );
    },
  };

  const { user } = useAuth();

  if (!user) return null;

  const RenderProfileComponents = PlanningPageByProfile[user.profileCategory];

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
        {RenderProfileComponents ? RenderProfileComponents(user) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

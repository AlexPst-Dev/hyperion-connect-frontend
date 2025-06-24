import React, { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import AppText from "../components/AppText";
import GlobalStyles from "../styles/styles";
import {
  ProfileCategory,
  SportsmanProfile,
  User,
  UserResponse,
} from "../models/user";
import ViewController from "../components/ViewController";
import Event from "../components/Event";
import AddContacts from "../components/popups/AddContacts";
import { useAuth } from "../hooks/useAuth";
import AppButton from "../components/AppButton";
import PopUp from "../components/PopUp";
import Input from "../components/Input";
import ItemUser from "../components/ItemUser";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { LoggedUser } from "../models/auth";
import { Event as EventModel, EventCategory } from "../models/event";
import { contactService } from "../services/api/contact-service";
import { UserService } from "../services/api/user-service";
import { notify } from "../components/NotificationContainer";

export default function CommunityScreen() {
  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "ContactDetail"
  >;
  const navigation = useNavigation<NavigationProp>();

  const { user, token } = useAuth();

  type CommunityPageRenderer = (user: LoggedUser) => JSX.Element;

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [addContactPopUpVisible, setAddContactPopUpVisible] = useState(false);
  const [eventDetailVisible, setDisplayEvent] = useState<EventModel | false>(
    false
  );
  const [
    editSportingActivityPopUpVisible,
    setEditSportingActivityPopUpVisible,
  ] = useState(false);

  if (!user) return null;

  const displayAddContactPopUp = () =>
    setAddContactPopUpVisible(!addContactPopUpVisible);

  const displayEventDetailPopup = (event?: EventModel) =>
    setDisplayEvent(event ? event : false);

  const handleEditSportingActivityPopUp = () =>
    setEditSportingActivityPopUpVisible(!editSportingActivityPopUpVisible);

  const [listOfContactUsers, setListOfContactUsers] = useState<UserResponse[]>(
    []
  );

  const [listContactLoading, setListContactLoading] = useState(false);

  async function fetchContacts() {
    if (user && token) {
      try {
        const reqIds = await contactService.getContactListByUserId(
          user.id,
          token
        );
        if (reqIds.userId && reqIds.contactIds.length > 0) {
          // Fetch all contacts in parallel
          const contacts = await Promise.all(
            reqIds.contactIds.map((contactId) =>
              UserService.getUserById(contactId)
            )
          );
          // Filter out any null/undefined results
          const validContacts = contacts.filter(Boolean) as UserResponse[];
          setListOfContactUsers(validContacts);
        } else {
          setListOfContactUsers([]);
        }
        setListContactLoading(false);
      } catch (e) {
        console.log("Error while fetching contact of the user", e);
        setListContactLoading(false);
      }
    }
  }

  useEffect(() => {
    setListContactLoading(true);
    fetchContacts();
  }, [user, token]);

  const handleAddContact = async (selectedUser: User[]) => {
    try {
      await Promise.all(
        selectedUser.map((u) =>
          contactService.updateContactListByUserId(user.id, u.id, "add", token!)
        )
      );
      await fetchContacts().then(() =>
        notify({
          title: "Utilisateur ajouté avec succès",
          type: "success",
        })
      );
    } catch (e) {
      console.log("Error while adding contacts", e);
    }
  };

  const tabViews: JSX.Element[] = [
    // Tab 0 : Sportsman
    <View key="sportsmans" style={{ flexDirection: "column", gap: 24 }}>
      {listContactLoading && <ActivityIndicator />}
      {listOfContactUsers.filter(
        (c) => c.user.profileCategory === ProfileCategory.SPORTSMAN
      ).length > 0 ? (
        listOfContactUsers
          .filter((c) => c.user.profileCategory === ProfileCategory.SPORTSMAN)
          .map((contact) => (
            <Pressable
              onPress={() => {
                navigation.navigate("ContactDetail", { contact: contact.user });
              }}
              key={contact.user.id}
            >
              <ItemUser
                key={contact.user.id}
                user={contact.user}
                isCompany={false}
                iconName="send"
              />
            </Pressable>
          ))
      ) : (
        <AppText>Aucun contact de cette catégorie.</AppText>
      )}
    </View>,

    // Tab 1 : Coachs
    <View key="coaches" style={{ flexDirection: "column", gap: 24 }}>
      {listContactLoading && <ActivityIndicator />}
      {listOfContactUsers.filter(
        (c) => c.user.profileCategory === ProfileCategory.COACH
      ).length > 0 ? (
        listOfContactUsers
          .filter((c) => c.user.profileCategory === ProfileCategory.COACH)
          .map((contact) => (
            <Pressable
              onPress={() => {
                navigation.navigate("ContactDetail", { contact: contact.user });
              }}
              key={contact.user.id}
            >
              <ItemUser
                key={contact.user.id}
                user={contact.user}
                isCompany={false}
                iconName="send"
              />
            </Pressable>
          ))
      ) : (
        <AppText>Aucun contact de cette catégorie.</AppText>
      )}
    </View>,

    // Tab 2 : Medic
    <View key="medics" style={{ flexDirection: "column", gap: 24 }}>
      {listContactLoading && <ActivityIndicator />}
      {listOfContactUsers.filter(
        (c) => c.user.profileCategory === ProfileCategory.MEDIC
      ).length > 0 ? (
        listOfContactUsers
          .filter((c) => c.user.profileCategory === ProfileCategory.MEDIC)
          .map((contact) => (
            <Pressable
              onPress={() => {
                navigation.navigate("ContactDetail", { contact: contact.user });
              }}
              key={contact.user.id}
            >
              <ItemUser
                key={contact.user.id}
                user={contact.user}
                isCompany={false}
                iconName="send"
              />
            </Pressable>
          ))
      ) : (
        <AppText>Aucun contact de cette catégorie.</AppText>
      )}
    </View>,
  ];

  const CommunityPageByProfile: Record<string, CommunityPageRenderer> = {
    sportsman: (user) => {
      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>PROCHAINS EVENEMENTS</AppText>
              {/* <Event
                title="Evénement Hyperion Vannes"
                type={EventCategory.HYPERION}
                personsInvolved={tempAdminUser}
                location="Parc de Vannes"
                date={new Date("2025-10-10")}
                hour="14h00"
              /> */}
            </View>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>ACTIVITES PROPOSEES</AppText>
              {/* <Event
                title="Sortie running Vannes 10km"
                type={EventCategory.SPORTING_ACTIVITY}
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
              /> */}
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
          <View style={{ flex: 1 }}>
            <ScrollView
              style={{
                height:
                  user.profileCategory === ProfileCategory.SPORTSMAN
                    ? 300
                    : 370,
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
                {tabViews[activeTabIndex]}
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
            token=""
            onClose={displayAddContactPopUp}
            onSubmit={(selectedUsers) => {
              handleAddContact(selectedUsers);
            }}
          />
        )}
        {/* {eventDetailVisible && (
          <DisplayEvent
            visible={!!eventDetailVisible}
            userConnected={user}
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
        )} */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import React, { JSX, useEffect, useMemo, useState } from "react";
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
import {
  useEventPersons,
  useEventsByCategories,
} from "../hooks/useEventsByCategories";
import DisplayEvent from "../components/popups/DisplayEvent";
import EditEvent from "../components/popups/EditEvent";

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
      const { eventsByCategory, eventsByCategoriesLoading, error } =
        useEventsByCategories(
          [EventCategory.HYPERION, EventCategory.SPORTING_ACTIVITY],
          token!
        );

      const [eventSelected, setEventSelected] = useState<EventModel>();
      const [personOnGoingOfSelectedEvent, setPersonOnGoingOfSelectedEvent] =
        useState<any[]>([]);
      const [eventDetailsPopUpVisible, setEventDetailsPopUpVisible] =
        useState(false);

      const allPersonIds = useMemo(() => {
        const hyperionEvents = eventsByCategory[EventCategory.HYPERION] || [];
        const allIds = hyperionEvents
          .map((event) => event.responsibleIds)
          .filter(Boolean)
          .join(";");
        return allIds;
      }, [eventsByCategory]);

      const { users: allUsers } = useEventPersons(allPersonIds, token!);

      const usersMap = useMemo(() => {
        const map = new Map();
        allUsers.forEach((user) => {
          map.set(user.id.toString(), user);
        });
        return map;
      }, [allUsers]);

      const getUsersForEvent = (ids: string | null) => {
        if (!ids) return [];

        return ids
          .split("; ")
          .filter(Boolean)
          .map((id) => usersMap.get(id))
          .filter(Boolean);
      };

      return (
        <>
          <View style={{ flexDirection: "column", gap: 24, paddingBottom: 32 }}>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>PROCHAINS EVENEMENTS</AppText>
              {eventsByCategoriesLoading ? (
                <AppText>Chargement...</AppText>
              ) : eventsByCategory[EventCategory.HYPERION] &&
                eventsByCategory[EventCategory.HYPERION].filter(
                  (e) =>
                    e.date !== null && new Date(e.date).getTime() > Date.now()
                ).length > 0 ? (
                eventsByCategory[EventCategory.HYPERION]
                  .filter(
                    (e) =>
                      e.date !== null && new Date(e.date).getTime() > Date.now()
                  )
                  .map((e) => {
                    const personsInvolved = getUsersForEvent(e.responsibleIds);

                    return (
                      <Event
                        key={e.id}
                        title={e.title ? e.title : "Séance"}
                        personsInvolved={personsInvolved}
                        location={e.location || ""}
                        date={new Date(e.date || "")}
                        isInPerson
                        hour={e.time || ""}
                        type={EventCategory.HYPERION}
                        onPress={() => {
                          setEventSelected(e);
                          setPersonOnGoingOfSelectedEvent(personsInvolved);
                          setEventDetailsPopUpVisible(true);
                        }}
                      />
                    );
                  })
              ) : (
                <AppText>Aucun évenement n'est prévu actuellement</AppText>
              )}
            </View>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>ACTIVITES PROPOSEES</AppText>
              {eventsByCategoriesLoading ? (
                <AppText>Chargement...</AppText>
              ) : eventsByCategory[EventCategory.SPORTING_ACTIVITY] &&
                eventsByCategory[EventCategory.SPORTING_ACTIVITY].filter(
                  (e) =>
                    e.date !== null && new Date(e.date).getTime() > Date.now()
                ).length > 0 ? (
                eventsByCategory[EventCategory.SPORTING_ACTIVITY]
                  .filter(
                    (e) =>
                      e.date !== null && new Date(e.date).getTime() > Date.now()
                  )
                  .map((e) => {
                    const personsInvolved = getUsersForEvent(e.responsibleIds);

                    return (
                      <Event
                        key={e.id}
                        title={e.title ? e.title : "Séance"}
                        personsInvolved={personsInvolved}
                        location={e.location || ""}
                        date={new Date(e.date || "")}
                        isInPerson
                        hour={e.time || ""}
                        type={EventCategory.HYPERION}
                        onPress={() => {
                          setEventSelected(e);
                          setPersonOnGoingOfSelectedEvent(personsInvolved);
                          setEventDetailsPopUpVisible(true);
                        }}
                      />
                    );
                  })
              ) : (
                <AppText>Aucun évenement n'est prévu actuellement</AppText>
              )}
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
          {editSportingActivityPopUpVisible && token && (
            <EditEvent
              visible={editSportingActivityPopUpVisible}
              token={token}
              onClose={() => setEditSportingActivityPopUpVisible(false)}
              title={"Créer une nouvelle activitée sportive"}
              eventType={EventCategory.SPORTING_ACTIVITY}
            />
          )}
          {eventDetailsPopUpVisible && eventSelected && (
            <DisplayEvent
              visible={eventDetailsPopUpVisible}
              event={eventSelected}
              userConnected={user}
              listOfUser={personOnGoingOfSelectedEvent}
              onClose={() => {
                setEventDetailsPopUpVisible(false);
              }}
              token={token!}
            />
          )}
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

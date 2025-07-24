import React, { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import AppText from "../components/AppText";
import GlobalStyles, { Colors } from "../styles/styles";
import { ProfileCategory, User, UserResponse } from "../models/user";
import ViewController from "../components/ViewController";
import Event from "../components/Event";
import AddContacts from "../components/popups/AddContacts";
import { useAuth } from "../hooks/useAuth";
import AppButton from "../components/AppButton";
import ItemUser from "../components/ItemUser";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { LoggedUser } from "../models/auth";
import {
  Event as EventModel,
  EventCategory,
  SportingActivityEvent,
  parseIds,
} from "../models/event";
import { contactService } from "../services/api/contact-service";
import { UserService } from "../services/api/user-service";
import { notify } from "../components/NotificationContainer";
import { useEventsByCategories } from "../hooks/useEventsByCategories";
import DisplayEvent from "../components/popups/DisplayEvent";
import EditEvent from "../components/popups/EditEvent";
import Label from "../components/Label";

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
            reqIds.contactIds.map(
              (contactId) =>
                UserService.getUserById(contactId)
                  .then((res) => res)
                  .catch(() => null) // Handle any errors in fetching individual users
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

      const [sportingActivityProps, setSportingActivityProps] =
        useState<SportingActivityEvent>();

      const [eventSelected, setEventSelected] = useState<EventModel>();
      const [eventDetailsPopUpVisible, setEventDetailsPopUpVisible] =
        useState(false);

      const [responsibleUsers, setResponsibleUsers] = useState<UserResponse[]>(
        []
      );

      const fetchUsersByIds = async (ids: number[], token: string) => {
        const users = await Promise.all(
          ids.map((id) => UserService.getUserById(id, token).catch(() => null))
        );
        // Filter out failed fetches
        return users.filter((u): u is UserResponse => u !== null).map((u) => u);
      };
      const handleOpenEvent = async (event: EventModel) => {
        setEventSelected(event);
        setEventDetailsPopUpVisible(true);

        // Parse IDs and fetch users
        const ids = parseIds(event.responsibleIds);
        if (ids.length && token) {
          const users = await fetchUsersByIds(ids, token);
          setResponsibleUsers(users);
        } else {
          setResponsibleUsers([]);
        }
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
                    return (
                      <Event
                        key={e.id}
                        title={e.title ? e.title : "Séance"}
                        personsInvolved={[]}
                        location={e.location || ""}
                        date={new Date(e.date || "")}
                        hour={e.time || ""}
                        type={EventCategory.HYPERION}
                        onPress={() => {
                          handleOpenEvent(e);
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
                  .map((e, index) => {
                    return (
                      <View key={index} style={{ position: "relative" }}>
                        {parseIds(e.personOngoingIds).includes(user.id) && (
                          <Label
                            title="Inscrit !"
                            size="small"
                            backgroundColor={"#DEFFD6"}
                            textColor={Colors.green}
                            labelStyle={{
                              position: "absolute",
                              zIndex: 99,
                              top: -8,
                              right: 8,
                            }}
                            labelTextStyle={{ fontWeight: "bold" }}
                            key={`${e.id}-${index}`}
                          />
                        )}
                        <Event
                          key={e.id}
                          title={e.title ? e.title : "Séance"}
                          personsInvolved={[]}
                          location={e.location || ""}
                          date={new Date(e.date || "")}
                          hour={e.time || ""}
                          type={EventCategory.SPORTING_ACTIVITY}
                          onPress={() => {
                            setSportingActivityProps(
                              e.specificEvent as SportingActivityEvent
                            );
                            handleOpenEvent(e);
                          }}
                        />
                      </View>
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
              listOfUser={responsibleUsers}
              onClose={() => setEventDetailsPopUpVisible(false)}
              token={token!}
              sportingActivityProps={sportingActivityProps}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

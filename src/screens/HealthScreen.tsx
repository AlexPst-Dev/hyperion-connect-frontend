import React, { JSX, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import AppText from "../components/AppText";
import GlobalStyles from "../styles/styles";
import ViewController from "../components/ViewController";
import Event from "../components/Event";
import {
  ProfileCategory,
  SportsmanProfile,
  User,
  UserResponse,
} from "../models/user";
import Icon from "../components/Icon";
import ItemUser from "../components/ItemUser";
import {
  Event as EventModel,
  EventCategory,
  EventCompleteResponse,
  parseIds,
} from "../models/event";
import { eventService } from "../services/api/event-service";
import { useAuth } from "../hooks/useAuth";
import { UserService } from "../services/api/user-service";
import { File } from "../models/file";
import { fileService } from "../services/api/file-service";
import DisplayEvent from "../components/popups/DisplayEvent";

export default function HealthScreen() {
  const { user, token } = useAuth();
  if (!user || !token) return;

  const [medicEvents, setMedicEvents] = useState<EventCompleteResponse[]>([]);
  const [inacitvesMedicEvents, setInactivesMedicEvents] = useState<
    EventCompleteResponse[]
  >([]);
  const [responsiblesMap, setResponsiblesMap] = useState<
    Record<number, User[]>
  >({});
  const [sportsmanNotes, setSportsmanNotes] = useState<
    { header: string; message: string }[]
  >([]);

  const [medicFiles, setMedicFiles] = useState<File[]>([]);

  const [linkedMedics, setLinkedMedics] = useState<User[]>([]);

  const [displayEventVisible, setDisplayEventVisible] = useState<
    EventModel | false
  >(false);

  async function fetchMedicEvents() {
    if (!user || !token) return;
    const completeEvents = await eventService.getEventsByUserId(user.id, token);
    const medicalEvents = completeEvents.events.filter(
      (e) =>
        e.eventCategory === EventCategory.MEDICAL &&
        e.isActive === true &&
        e.date !== null &&
        new Date(e.date).getTime() > Date.now()
    );
    const oldMedicalEvents = completeEvents.events.filter(
      (e) =>
        e.eventCategory === EventCategory.MEDICAL &&
        (e.isActive === false ||
          (e.date !== null && new Date(e.date).getTime() < Date.now()))
    );
    setMedicEvents(medicalEvents);
    setInactivesMedicEvents(oldMedicalEvents);

    // Fetch responsibles for each event
    const responsiblesPromises = completeEvents.events.map(async (event) => {
      const ids = parseIds(event.responsibleIds);
      const users: User[] = [];
      for (const id of ids) {
        try {
          const res = await UserService.getUserById(id, token);
          if (res.user) users.push(res.user);
        } catch (e) {
          // Optionally handle error
        }
      }
      return { eventId: event.id, users };
    });

    const responsiblesArray = await Promise.all(responsiblesPromises);
    const map: Record<number, User[]> = {};
    responsiblesArray.forEach(({ eventId, users }) => {
      map[eventId] = users;
    });
    setResponsiblesMap(map);
  }

  async function fetchMedicNotes() {
    if (!user) return;
    const getAllNotes = (notesString?: string) => {
      if (!notesString) return [];
      // Split on };{ and fix the curly braces
      return notesString.split(/};\s*{/).map((note, idx, arr) => {
        // Add missing braces for first and last
        let cleanNote = note;
        if (idx === 0 && !note.startsWith("{")) cleanNote = "{" + note;
        if (idx === arr.length - 1 && !note.endsWith("}"))
          cleanNote = note + "}";
        if (idx !== 0 && !note.startsWith("{")) cleanNote = "{" + note;
        if (idx !== arr.length - 1 && !note.endsWith("}"))
          cleanNote = note + "}";
        // Now parse header/message
        const firstComma = cleanNote.indexOf(",");
        if (firstComma === -1) return { header: cleanNote, message: "" };
        const header = cleanNote.slice(1, firstComma).trim();
        const message = cleanNote
          .slice(firstComma + 1, cleanNote.length - 1)
          .trim();
        return { header, message };
      });
    };

    const completeUser: UserResponse = await UserService.getUserById(user.id);
    const notesString = (completeUser.profile as SportsmanProfile)
      ?.listMedicNotes;
    const allNotes = getAllNotes(notesString);
    setSportsmanNotes(allNotes);
  }

  async function fetchMedicFiles() {
    if (!user || !token) return;
    const completeUser: UserResponse = await UserService.getUserById(user.id);
    if ((completeUser.profile as SportsmanProfile)?.listMedicFiles) {
      const listMedicFiles = (completeUser.profile as SportsmanProfile)
        .listMedicFiles;
      const ids = listMedicFiles
        ? listMedicFiles
            .split(";")
            .map((id) => parseInt(id, 10))
            .filter((id) => !isNaN(id))
        : [];
      try {
        const files = await Promise.all(
          ids.map((id) => fileService.getFileById(id, token))
        );
        setMedicFiles(files);
      } catch {
        setMedicFiles([]);
      }
    }
  }

  async function fetchMedicUsers() {
    if (!user || !token) return;
    const completeUser: UserResponse = await UserService.getUserById(user.id);
    if ((completeUser.profile as SportsmanProfile)?.listMedicsIds) {
      const listMedicsIds = (completeUser.profile as SportsmanProfile)
        .listMedicsIds;
      const ids = listMedicsIds
        ? listMedicsIds
            .split(";")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id))
        : [];
      try {
        const users = await Promise.all(
          ids.map((id) => UserService.getUserById(id, token))
        );
        setLinkedMedics(users.map((res) => res.user));
      } catch {
        setLinkedMedics([]);
      }
    } else {
      setLinkedMedics([]);
    }
  }

  useEffect(() => {
    if (!user || !token) return;
    try {
      fetchMedicEvents();
      fetchMedicNotes();
      fetchMedicFiles();
      fetchMedicUsers();
    } catch (e) {
      console.log("Error while fetching medic infos : ", e);
    }
  }, [user, token]);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabViews: JSX.Element[] = [
    <View key={"meetings"} style={{ flexDirection: "column", gap: 24 }}>
      <AppText>Préparez-vous pour vos prochains rendez-vous médicaux.</AppText>
      {medicEvents.map((me) => (
        <Event
          key={me.id}
          type={EventCategory.MEDICAL}
          title={me.title ? me.title : "Rendez-vous"}
          personsInvolved={responsiblesMap[me.id] || []}
          location={me.location ? me.location : "Lieu non renseigné"}
          date={new Date(me.date ?? "")}
          hour={me.time ?? ""}
          onPress={() => setDisplayEventVisible(me)}
        />
      ))}

      <AppText>
        Consultez vos rendez-vous précédents pour suivre votre historique.
      </AppText>
      {inacitvesMedicEvents.map((me) => (
        <Event
          key={me.id}
          type={EventCategory.MEDICAL}
          title={me.title ? me.title : "Rendez-vous"}
          personsInvolved={responsiblesMap[me.id] || []}
          location={me.location ? me.location : "Lieu non renseigné"}
          date={new Date(me.date ?? "")}
          hour={me.time ?? ""}
          onPress={() => setDisplayEventVisible(me)}
        />
      ))}

      {displayEventVisible && (
        <DisplayEvent
          visible={true}
          event={displayEventVisible}
          userConnected={user}
          listOfUser={responsiblesMap[displayEventVisible.id]}
          onClose={() => setDisplayEventVisible(false)}
        />
      )}
    </View>,
    <View key={"medicNotes"} style={{ flexDirection: "column", gap: 24 }}>
      <AppText style={{ fontWeight: "bold" }}>Notes médicales</AppText>
      <ScrollView
        style={{
          flexDirection: "column",
          gap: 8,
          paddingLeft: 16,
          borderLeftWidth: 4,
          borderLeftColor: "black",
          height: 250,
        }}
      >
        {sportsmanNotes.length > 0 ? (
          sportsmanNotes.map((note, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <AppText style={{ fontWeight: "bold" }}>{note.header}</AppText>
              <AppText>{note.message}</AppText>
            </View>
          ))
        ) : (
          <AppText>Aucune note</AppText>
        )}
      </ScrollView>
      <View style={{ flexDirection: "column", gap: 16 }}>
        <AppText style={GlobalStyles.h3}>Fichiers médicaux</AppText>
        <View style={{ flexDirection: "column", gap: 8 }}>
          {medicFiles.length > 0 ? (
            medicFiles.map((file) => (
              <View
                key={file.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <AppText>{file.label}</AppText>
                <Icon
                  name="download"
                  width={24}
                  height={24}
                  fillColor="transparent"
                  strokeColor="black"
                  strokeWidth={2}
                />
              </View>
            ))
          ) : (
            <AppText>Aucun compte rendu médical</AppText>
          )}
        </View>
      </View>
    </View>,
    <View key={"medics"} style={{ flexDirection: "column", gap: 24 }}>
      <AppText>
        Retrouvez ici la liste des intervenants médicaux avec qui vous avez eu
        au moins un rendez-vous.
      </AppText>
      <View style={{ flexDirection: "column", gap: 16 }}>
        {linkedMedics.length > 0 ? (
          linkedMedics.map((medic) => (
            <View key={medic.id} style={{ flexDirection: "column", gap: 8 }}>
              <ItemUser user={medic} isCompany={false} />
            </View>
          ))
        ) : (
          <AppText>Aucun soignant lié</AppText>
        )}
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

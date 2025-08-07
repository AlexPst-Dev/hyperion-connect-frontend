import * as Calendar from "expo-calendar";
import { Platform } from "react-native";
import { Event as EventModel } from "../models/event";
import { Availability, EventStatus } from "expo-calendar";
import { notify } from "../components/NotificationContainer";

/**
 * Demande les permissions pour accéder au calendrier
 */
export const requestCalendarPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Erreur lors de la demande de permissions:", error);
    return false;
  }
};

/**
 * Récupère le calendrier par défaut de l'utilisateur
 */
export const getDefaultCalendar = async (): Promise<string | null> => {
  try {
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );

    // Cherche le calendrier par défaut selon la plateforme
    let defaultCalendar = calendars.find((cal) => cal.isPrimary);

    if (!defaultCalendar) {
      // Si pas de calendrier primaire, prend le premier calendrier modifiable
      defaultCalendar = calendars.find((cal) => cal.allowsModifications);
    }

    if (!defaultCalendar && calendars.length > 0) {
      // En dernier recours, prend le premier calendrier disponible
      defaultCalendar = calendars[0];
    }

    return defaultCalendar?.id || null;
  } catch (error) {
    console.error("Erreur lors de la récupération du calendrier:", error);
    return null;
  }
};

/**
 * Convertit une date et heure en objet Date
 */
const parseEventDateTime = (
  dateStr: string | null,
  timeStr: string | null
): Date => {
  if (!dateStr) {
    return new Date();
  }

  const date = new Date(dateStr);

  if (timeStr) {
    // Parse l'heure si elle est fournie (format attendu: "HH:mm" ou "HH:mm:ss")
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      date.setHours(hours, minutes, 0, 0);
    }
  } else {
    // Si pas d'heure spécifiée, met à 12h00
    date.setHours(12, 0, 0, 0);
  }

  return date;
};

/**
 * Ajoute un événement au calendrier natif
 */
export const addEventToCalendar = async (
  event: EventModel
): Promise<boolean> => {
  try {
    // Vérifier les permissions
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      notify({
        title:
          "L'application a besoin d'accéder à votre calendrier pour ajouter cet événement.",
        type: "information",
      });
      return false;
    }

    // Récupérer le calendrier par défaut
    const defaultCalendarId = await getDefaultCalendar();
    if (!defaultCalendarId) {
      notify({
        title: "Aucun calendrier disponible sur cet appareil.",
        type: "error",
      });
      return false;
    }

    // Préparer les données de l'événement
    const startDate = parseEventDateTime(event.date, event.time);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 heure par défaut

    const calendarEvent: Calendar.Event = {
      title: event.title || "Événement sans titre",
      startDate,
      endDate,
      location: event.location || null,
      notes: event.description || "",
      url: event.link || undefined,
      calendarId: defaultCalendarId,
      timeZone: "Europe/Paris",
      id: "",
      alarms: [],
      recurrenceRule: null,
      allDay: false,
      availability: Availability.NOT_SUPPORTED,
      status: EventStatus.NONE,
    };

    // Créer l'événement
    const eventId = await Calendar.createEventAsync(
      defaultCalendarId,
      calendarEvent
    );

    if (eventId) {
      notify({
        title: "L'événement a été ajouté à votre calendrier !",
        type: "success",
      });
      return true;
    } else {
      throw new Error("Échec de la création de l'événement");
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout à l'agenda:", error);
    notify({
      title:
        "Une erreur s'est produite lors de l'ajout de l'événement au calendrier.",
      type: "error",
    });
    return false;
  }
};

/**
 * Fonction helper pour gérer le clic sur l'ajout au calendrier
 */
export const handleAddToCalendar = async (event: EventModel) => {
  if (!event.date) {
    notify({
      title: "Cet événement n'a pas de date définie.",
      type: "error",
    });
    return;
  }
  if (Platform.OS === "web") {
    // Pour le web, créer un lien .ics ou utiliser une autre solution
    notify({
      title: "L'ajout au calendrier n'est disponible que sur mobile.",
      type: "error",
    });
    return;
  }

  await addEventToCalendar(event);
};

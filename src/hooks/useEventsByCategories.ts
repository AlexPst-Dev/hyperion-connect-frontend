import { useEffect, useState } from "react";
import { EventCategory, EventCompleteResponse } from "../models/event";
import { eventService } from "../services/api/event-service";
import { ProfileCategory, User } from "../models/user";
import { UserService } from "../services/api/user-service";
import { useAuth } from "./useAuth";

export function useEventsByCategories(
  categories: EventCategory[],
  token: string | undefined,
  showInactives?: boolean
) {
  const [eventsByCategory, setEventsByCategory] = useState<
    Record<EventCategory, EventCompleteResponse[]>
  >(() => {
    const initial = {} as Record<EventCategory, EventCompleteResponse[]>;
    categories.forEach((cat) => {
      initial[cat] = [];
    });
    return initial;
  });

  const [eventsByCategoriesLoading, setEventsByCategoriesLoading] =
    useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!token || categories.length === 0) return;

    setEventsByCategoriesLoading(true);
    setError(null);

    Promise.all(
      categories.map(
        (cat) =>
          eventService
            .getEventsByCategory(cat, token)
            .then((res) => ({ cat, events: res.events || [] })) // Fallback sur []
            .catch((err) => ({ cat, events: [], error: err })) // Gestion d'erreur par catégorie
      )
    )
      .then((results) => {
        const byCat = {} as Record<EventCategory, EventCompleteResponse[]>;
        results.forEach(({ cat, events }) => {
          // If sporting activity and user is admin, show all (including inactive)
          if (
            (cat === EventCategory.SPORTING_ACTIVITY &&
              user?.profileCategory === ProfileCategory.ADMIN) ||
            showInactives
          ) {
            byCat[cat] = events.filter((e) => e.isActive === false);
          } else {
            // Otherwise, filter only active events
            byCat[cat] = events.filter((e) => e.isActive);
          }
        });
        setEventsByCategory(byCat);
      })
      .catch((err) => setError(err))
      .finally(() => setEventsByCategoriesLoading(false));
  }, [categories.join(","), token]); // Dépendance plus stable

  return { eventsByCategory, eventsByCategoriesLoading, error };
}

export function useEventPersons(
  personOngoingIds: string | null,
  token: string | undefined
) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!personOngoingIds || !token) {
      setUsers([]);
      return;
    }
    setLoading(true);
    const ids = personOngoingIds
      .split(";")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));
    Promise.all(
      ids.map((id) =>
        UserService.getUserById(id, token).then((res) => res.user)
      )
    )
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [personOngoingIds, token]);

  return { users, loading };
}

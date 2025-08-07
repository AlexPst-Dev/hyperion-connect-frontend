import { useEffect, useState } from "react";
import { ObjectivesApiService } from "../services/api/objective-service";
import { UserService } from "../services/api/user-service";
import { User } from "../models/user";

export function useCoachClients(coachId: number, token: string | undefined) {
  const [coachClients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coachId || !token) return;
    let isMounted = true;
    setLoading(true);

    async function fetchClients() {
      try {
        const objectives =
          await ObjectivesApiService.getObjectivesByResponsible(
            coachId,
            token as string
          );
        // Get unique sportsman IDs
        const sportsmanIds = Array.from(
          new Set(objectives.map((obj) => obj.sportsmanId))
        );
        // Fetch user data for each sportsman
        const users = await Promise.all(
          sportsmanIds.map((id) =>
            UserService.getUserById(id, token).then((res) => res.user)
          )
        );
        if (isMounted) setClients(users);
      } catch (e) {
        if (isMounted) setClients([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchClients();
    return () => {
      isMounted = false;
    };
  }, [coachId, token]);

  return { coachClients, loading };
}

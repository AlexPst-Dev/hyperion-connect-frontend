import { useEffect, useState } from "react";
import { UserService } from "../services/api/user-service";
import { User, SportsmanProfile, ProfileCategory } from "../models/user";

export function useMedicClients(medicId: number, token: string | undefined) {
  const [medicClients, setMedicClients] = useState<User[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  useEffect(() => {
    if (!medicId || !token) return;
    let isMounted = true;
    setPatientsLoading(true);

    async function fetchClients() {
      try {
        // Fetch all sportsmen
        const sportsmenProfiles = await UserService.getAllSportsmen(token);
        // Filter sportsmen where listMedicsIds includes medicId
        const filtered = sportsmenProfiles
          .filter(
            (item) =>
              item.profile &&
              item.profile.user &&
              item.profile.user.profileCategory === ProfileCategory.SPORTSMAN &&
              (item.profile as SportsmanProfile).listMedicsIds &&
              (item.profile as SportsmanProfile)
                .listMedicsIds!.split(";")
                .map((id) => parseInt(id.trim(), 10))
                .filter((id) => !isNaN(id))
                .includes(medicId)
          )
          .map((item) => item.profile!.user);

        if (isMounted) setMedicClients(filtered);
      } catch (e) {
        if (isMounted) setMedicClients([]);
      } finally {
        if (isMounted) setPatientsLoading(false);
      }
    }

    fetchClients();
    return () => {
      isMounted = false;
    };
  }, [medicId, token]);

  return { medicClients, patientsLoading };
}

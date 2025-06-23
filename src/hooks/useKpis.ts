import { useEffect, useState } from "react";
import { IconName } from "../components/Icon";
import { ProfileCategory, User } from "../models/user";
import { UserService } from "../services/api/user-service";

export interface KpiModel {
  title: string;
  iconName: IconName;
  value: string;
  unit?: string;
  fillIcon?: boolean;
}

export function useKpis(profileCategory: ProfileCategory, token: string) {
  const [kpis, setKpis] = useState<KpiModel[]>([]);
  const [kpisLoading, setKpisLoading] = useState<boolean>(true);
  const [kpisError, setKpisError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchKpis() {
      setKpisLoading(true);
      setKpisError(null);
      try {
        switch (profileCategory) {
          case ProfileCategory.ADMIN: {
            /*
             * KPI 1 : All actives users (last connection 30 days ago)
             * KPI 2 : Get all sportsman
             * KPI 3 : Difference between nb of users created and actives (inactive users) as percentage
             */
            const [usersResponse, sportsmansRaw, userCountResponse] =
              await Promise.all([
                UserService.getAllUsers(token),
                UserService.getAllSportsmen(token),
                UserService.getUsersPaginated(token, 1, 0),
              ]);
            const allUsersCount = userCountResponse.total;
            // Handle both array and object response
            const users = Array.isArray(usersResponse)
              ? usersResponse
              : usersResponse.users || [];
            const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            const activeUsers = users.filter(
              (u: User) =>
                u.isActive &&
                u.updatedAt &&
                now - new Date(u.updatedAt).getTime() <= THIRTY_DAYS
            );
            const sportsmans = Array.isArray(sportsmansRaw)
              ? sportsmansRaw.filter(
                  (res: any) => res.profile?.user.isActive === true
                )
              : [];
            if (isMounted) {
              setKpis([
                {
                  title: "Utilisateurs actifs",
                  iconName: "user",
                  value: activeUsers.length.toString(),
                  unit: "actifs",
                  fillIcon: true,
                },
                {
                  title: "Nombre de sportifs",
                  iconName: "dumbell",
                  value: sportsmans.length.toString(),
                  unit: "sportifs",
                  fillIcon: true,
                },
                {
                  title: "Taux de rétention",
                  iconName: "objective",
                  value: ((activeUsers.length / allUsersCount) * 100).toFixed(
                    1
                  ),
                  unit: "%",
                  fillIcon: false,
                },
              ]);
            }
            break;
          }
          default:
            if (isMounted) setKpis([]);
            break;
        }
      } catch (err: any) {
        if (isMounted)
          setKpisError(err.message || "Erreur lors du chargement des KPIs");
      } finally {
        if (isMounted) setKpisLoading(false);
      }
    }
    fetchKpis();
    return () => {
      isMounted = false;
    };
  }, [profileCategory, token]);

  return { kpis, kpisLoading, kpisError };
}

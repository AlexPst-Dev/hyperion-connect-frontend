import { useEffect, useState } from "react";
import { IconName } from "../components/Icon";
import { ProfileCategory, User } from "../models/user";
import { UserService } from "../services/api/user-service";
import { useAuth } from "./useAuth";
import { clientService } from "../services/api/client-service";
import { eventService } from "../services/api/event-service";
import { CoachingEvent, EventCategory, MedicalEvent } from "../models/event";
import { ObjectivesApiService } from "../services/api/objective-service";
import { OffersApiService } from "../services/api/offer-service";
import { CompanyService } from "../services/api/company-service";

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

  const { user } = useAuth();

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
          case ProfileCategory.COACH: {
            /*
             * KPI 1 : Number of clients (sportsmans)
             * KPI 2 : Coaching event done
             * KPI 3 : Average motivation of all his coaching event (sportsman note)
             */
            if (user) {
              const [clients, completeEvents] = await Promise.all([
                clientService.getClientListByProfessionalId(user.id, token),
                eventService.getEventsByUserId(user.id, token),
              ]);

              // Only keep coaching events with a valid specificEvent
              const events = completeEvents.events.filter(
                (e) => e.eventCategory === EventCategory.COACHING
              );

              // Fetch details for each coaching event
              const coachingEvents = await Promise.all(
                events.map(async (e) => {
                  const res = await eventService.getEventById(e.id, token);
                  return res.event;
                })
              );

              // Only consider events with a valid numeric sportsmanNote
              const notes = coachingEvents
                .filter(
                  (c) => (c.specificEvent as CoachingEvent).isDone === true
                )
                .map((e) =>
                  Number((e.specificEvent as CoachingEvent).sportsmanNote)
                )
                .filter((note) => !isNaN(note));

              const averageNote =
                notes.length > 0
                  ? (
                      notes.reduce((sum, n) => sum + n, 0) / notes.length
                    ).toFixed(1)
                  : "0";

              if (isMounted) {
                setKpis([
                  {
                    title: "Sportifs coachés",
                    iconName: "user",
                    value: clients?.clientIds?.length
                      ? clients.clientIds.length.toString()
                      : "0",
                    unit: "sportifs",
                    fillIcon: true,
                  },
                  {
                    title: "Séance réalisées",
                    iconName: "dumbell",
                    value: coachingEvents
                      .filter(
                        (e) =>
                          (e.specificEvent as CoachingEvent).isDone === true
                      )
                      .length.toString(),
                    unit: "séances",
                    fillIcon: true,
                  },
                  {
                    title: "Motivation moyenne",
                    iconName: "star",
                    value: averageNote,
                    unit: "",
                    fillIcon: true,
                  },
                ]);
              }
            }
            break;
          }
          case ProfileCategory.MEDIC: {
            /*
             * KPI 1 : Number of clients (sportsmans)
             * KPI 2 : Coaching event done
             */
            if (user) {
              const [clients, completeEvents] = await Promise.all([
                clientService.getClientListByProfessionalId(user.id, token),
                eventService.getEventsByUserId(user.id, token),
              ]);

              // Only keep coaching events with a valid specificEvent
              const events = completeEvents.events.filter(
                (e) => e.eventCategory === EventCategory.MEDICAL
              );

              // Fetch details for each coaching event
              const medicEvents = await Promise.all(
                events.map(async (e) => {
                  const res = await eventService.getEventById(e.id, token);
                  return res.event;
                })
              );

              if (isMounted) {
                setKpis([
                  {
                    title: "Patients suivi",
                    iconName: "user",
                    value: clients?.clientIds?.length
                      ? clients.clientIds.length.toString()
                      : "0",
                    unit: "sportifs",
                    fillIcon: true,
                  },
                  {
                    title: "Rdv réalisées",
                    iconName: "calendar",
                    value: medicEvents
                      .filter((e) => e.specificEvent as MedicalEvent)
                      .length.toString(),
                    unit: "",
                    fillIcon: true,
                  },
                ]);
              }
            }
            break;
          }
          case ProfileCategory.SPORTSMAN: {
            /*
             * KPI 1 : Progression of his objective (last one)
             * KPI 2 : Number of session done
             * KPI 3 : Average motivation of all his coaching event (sportsman note)
             */
            if (user) {
              const [objective, completeEvents] = await Promise.all([
                ObjectivesApiService.getObjectivesBySportsman(user.id, token),
                eventService.getEventsByUserId(user.id, token),
              ]);

              // Only keep coaching events with a valid specificEvent
              const events = completeEvents.events.filter(
                (e) => e.eventCategory === EventCategory.COACHING
              );

              // Fetch details for each coaching event
              const coachingEvents = await Promise.all(
                events.map(async (e) => {
                  const res = await eventService.getEventById(e.id, token);
                  return res.event;
                })
              );

              // Only consider events with a valid numeric sportsmanNote
              const notes = coachingEvents
                .filter(
                  (c) => (c.specificEvent as CoachingEvent).isDone === true
                )
                .map((e) =>
                  Number((e.specificEvent as CoachingEvent).sportsmanNote)
                )
                .filter((note) => !isNaN(note));

              const averageNote =
                notes.length > 0
                  ? (
                      notes.reduce((sum, n) => sum + n, 0) / notes.length
                    ).toFixed(1)
                  : "0";

              let globalProgression = "0";
              if (objective && objective.length > 0) {
                const obj = objective[0];
                const start = new Date(obj.startDate).getTime();
                const end = new Date(obj.endDate).getTime();
                const now = Date.now();
                if (end > start) {
                  const progress = ((now - start) / (end - start)) * 100;
                  globalProgression = Math.max(
                    0,
                    Math.min(100, progress)
                  ).toFixed(1);
                }
              }

              if (isMounted) {
                setKpis([
                  {
                    title: "Prgoression globale",
                    iconName: "star",
                    value: globalProgression,
                    unit: "%",
                    fillIcon: true,
                  },
                  {
                    title: "Séances réalisées",
                    iconName: "calendar",
                    value: coachingEvents
                      .filter(
                        (e) =>
                          (e.specificEvent as CoachingEvent).isDone === true
                      )
                      .length.toString(),
                    unit: "",
                    fillIcon: true,
                  },
                  {
                    title: "Motivation moyenne",
                    iconName: "star",
                    value: averageNote,
                    unit: "/10",
                    fillIcon: true,
                  },
                ]);
              }
            }
            break;
          }
          case ProfileCategory.PARTNER: {
            /*
             * KPI 1 : Number of posted offers (active ones)
             * KPI 2 : Number of active users on the app
             */
            const [usersResponse, offersResponse, companiesResponse] =
              await Promise.all([
                UserService.getAllUsers(token),
                OffersApiService.getAllOffers(token),
                CompanyService.getAllCompanies(token),
              ]);
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

            if (!user)
              setKpisError(
                "Immpossible de récupérer l'utilisateur pour charger ses KPIs"
              );

            const company = companiesResponse.filter(
              (c) => c.responsibleId === user?.id
            )[0];
            const offersCount = offersResponse.filter(
              (o) => o.companyId === company.id && o.isActive
            ).length;

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
                  title: "Offres publiées",
                  iconName: "ticket",
                  value: offersCount.toString(),
                  unit: "offres",
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

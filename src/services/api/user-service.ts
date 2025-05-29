import { apiClient } from "./client";
import {
  User,
  UserProfile,
  SportsmanUser,
  CoachUser,
  MedicUser,
  FreeUser,
  PartnerUser,
  AdminUser,
  ProfileCategory,
  CreateUserProfilePayload,
  UserResponse,
  LoginResponse,
  RegisterResponse,
} from "../../models/user";

export class UserService {
  /**
   * Retrieves all users
   */
  static async getAllUsers(token: string): Promise<User[]> {
    return apiClient.get<User[]>("/users", token);
  }

  /**
   * Retrieves a user by their ID with their profile
   */
  static async getUserById(
    userId: number,
    token?: string
  ): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/users/${userId}`, token);
  }

  /**
   * Retrieves all users of a specific profile category
   */
  static async getUsersByProfileCategory(
    category: ProfileCategory,
    token?: string
  ): Promise<{ profile: UserProfile | null }[]> {
    return apiClient.get<{ profile: UserProfile | null }[]>(
      `/users/category/${category}`,
      token
    );
  }

  /**
   * Retrieves a sportsman's subscription by their user ID
   */
  static async getSubscriptionBySportsmanUserId(
    userId: number,
    token: string
  ): Promise<{ subscription: any | null }> {
    return apiClient.get<{ subscription: any | null }>(
      `/users/${userId}/subscription`,
      token
    );
  }

  /**
   * Retrieves a sportsman's graph by their user ID
   */
  static async getGraphBySportsmanUserId(
    userId: number,
    token?: string
  ): Promise<{ graph: any | null }> {
    return apiClient.get<{ graph: any | null }>(
      `/users/${userId}/graph`,
      token
    );
  }

  /**
   * Retrieves a partner's company by their user ID
   */
  static async getCompanyByPartnerId(
    userId: number,
    token?: string
  ): Promise<{ company: any | null }> {
    return apiClient.get<{ company: any | null }>(
      `/users/${userId}/company`,
      token
    );
  }

  /**
   * Updates a user by their ID (basic data only)
   */
  static async updateUserById(
    userId: number,
    userData: Partial<User>,
    token: string
  ): Promise<{ message: string; user: User }> {
    return apiClient.put<{ message: string; user: User }>(
      `/users/${userId}`,
      userData,
      token
    );
  }

  /**
   * Updates a user with their profile by ID and category
   */
  static async updateUserByProfileAndId(
    userId: number,
    profileCategory: ProfileCategory,
    userData: any,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      `/users/${userId}/${profileCategory}`,
      userData,
      token
    );
  }

  /**
   * Deletes a user by their ID
   */
  static async deleteUserById(
    userId: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/${userId}`, token);
  }

  // Methods specific to user types

  /**
   * Retrieves all sportsmen
   */
  static async getAllSportsmen(
    token?: string
  ): Promise<{ profile: UserProfile | null }[]> {
    return this.getUsersByProfileCategory(ProfileCategory.SPORTSMAN, token);
  }

  /**
   * Retrieves all coaches
   */
  static async getAllCoaches(
    token?: string
  ): Promise<{ profile: UserProfile | null }[]> {
    return this.getUsersByProfileCategory(ProfileCategory.COACH, token);
  }

  /**
   * Retrieves all medics
   */
  static async getAllMedics(
    token?: string
  ): Promise<{ profile: UserProfile | null }[]> {
    return this.getUsersByProfileCategory(ProfileCategory.MEDIC, token);
  }

  /**
   * Retrieves all free users
   */
  static async getAllFreeUsers(
    token?: string
  ): Promise<{ profile: UserProfile | null }[]> {
    return this.getUsersByProfileCategory(ProfileCategory.FREE, token);
  }

  /**
   * Retrieves all partners
   */
  static async getAllPartners(
    token?: string
  ): Promise<{ profile: UserProfile | null }[]> {
    return this.getUsersByProfileCategory(ProfileCategory.PARTNER, token);
  }

  /**
   * Retrieves all administrators
   */
  static async getAllAdmins(
    token: string
  ): Promise<{ profile: UserProfile | null }[]> {
    return this.getUsersByProfileCategory(ProfileCategory.ADMIN, token);
  }

  // Specific update methods

  /**
   * Updates a sportsman
   */
  static async updateSportsman(
    userId: number,
    sportsmanData: Partial<SportsmanUser>,
    token: string
  ): Promise<{ message: string }> {
    return this.updateUserByProfileAndId(
      userId,
      ProfileCategory.SPORTSMAN,
      sportsmanData,
      token
    );
  }

  /**
   * Updates a coach
   */
  static async updateCoach(
    userId: number,
    coachData: Partial<CoachUser>,
    token: string
  ): Promise<{ message: string }> {
    return this.updateUserByProfileAndId(
      userId,
      ProfileCategory.COACH,
      coachData,
      token
    );
  }

  /**
   * Updates a medic
   */
  static async updateMedic(
    userId: number,
    medicData: Partial<MedicUser>,
    token: string
  ): Promise<{ message: string }> {
    return this.updateUserByProfileAndId(
      userId,
      ProfileCategory.MEDIC,
      medicData,
      token
    );
  }

  /**
   * Updates a free user
   */
  static async updateFreeUser(
    userId: number,
    freeUserData: Partial<FreeUser>,
    token: string
  ): Promise<{ message: string }> {
    return this.updateUserByProfileAndId(
      userId,
      ProfileCategory.FREE,
      freeUserData,
      token
    );
  }

  /**
   * Updates a partner
   */
  static async updatePartner(
    userId: number,
    partnerData: Partial<PartnerUser>,
    token: string
  ): Promise<{ message: string }> {
    return this.updateUserByProfileAndId(
      userId,
      ProfileCategory.PARTNER,
      partnerData,
      token
    );
  }

  /**
   * Updates an administrator
   */
  static async updateAdmin(
    userId: number,
    adminData: Partial<AdminUser>,
    token: string
  ): Promise<{ message: string }> {
    return this.updateUserByProfileAndId(
      userId,
      ProfileCategory.ADMIN,
      adminData,
      token
    );
  }

  // Utility methods

  /**
   * Checks if a user is a sportsman
   */
  static isSportsman(user: User): user is SportsmanUser {
    return user.profileCategory === ProfileCategory.SPORTSMAN;
  }

  /**
   * Checks if a user is a coach
   */
  static isCoach(user: User): user is CoachUser {
    return user.profileCategory === ProfileCategory.COACH;
  }

  /**
   * Checks if a user is a medic
   */
  static isMedic(user: User): user is MedicUser {
    return user.profileCategory === ProfileCategory.MEDIC;
  }

  /**
   * Checks if a user is a free user
   */
  static isFreeUser(user: User): user is FreeUser {
    return user.profileCategory === ProfileCategory.FREE;
  }

  /**
   * Checks if a user is a partner
   */
  static isPartner(user: User): user is PartnerUser {
    return user.profileCategory === ProfileCategory.PARTNER;
  }

  /**
   * Checks if a user is an administrator
   */
  static isAdmin(user: User): user is AdminUser {
    return user.profileCategory === ProfileCategory.ADMIN;
  }

  /**
   * Formats the complete information of a user
   */
  static formatUserInfo(user: User): string {
    const fullName = `${user.firstName} ${user.lastName}`;
    const category =
      user.profileCategory.charAt(0).toUpperCase() +
      user.profileCategory.slice(1);
    return `${fullName} (${category})`;
  }

  /**
   * Checks if a user is active
   */
  static isUserActive(user: User): boolean {
    return user.isActive;
  }

  /**
   * Retrieves the full name of a user
   */
  static getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Retrieves the age of a user from their birth date
   */
  static getUserAge(user: User): number | null {
    if (!user.birthDate) return null;

    const birthDate = new Date(user.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}

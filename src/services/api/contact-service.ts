import { apiClient } from "./client";
import { Contact } from "../../models/contact";

export const contactService = {
  async createContactList(
    userId: number,
    contactId: number,
    token: string
  ): Promise<{ message: string; contactList: Contact }> {
    return apiClient.post<{ message: string; contactList: Contact }>(
      "/contacts",
      { userId, contactId },
      token
    );
  },

  async getContactListByUserId(
    userId: number,
    token: string
  ): Promise<{ userId: number; contactIds: number[] }> {
    return apiClient.get<{ userId: number; contactIds: number[] }>(
      `/contacts/${userId}`,
      token
    );
  },

  async updateContactListByUserId(
    userId: number,
    contactId: number,
    method: "add" | "remove",
    token: string
  ): Promise<{ message: string; contactIds: string[] }> {
    return apiClient.post<{ message: string; contactIds: string[] }>(
      `/contacts/update/${userId}`,
      { contactId, method },
      token
    );
  },

  async clearContactListByUserId(
    userId: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      `/contacts/${userId}/clear`,
      {},
      token
    );
  },
};

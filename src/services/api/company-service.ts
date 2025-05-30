import { apiClient } from "./client";
import { User } from "../../models/user";
import {
  CreateCompanyPayload,
  CreateCompanyResponse,
  Company,
  GetResponsibleResponse,
  UpdateCompanyPayload,
  UpdateCompanyResponse,
  DeleteCompanyResponse,
} from "@/src/models/company";

export class CompanyService {
  /**
   * Creates a new company
   */
  static async createCompany(
    companyData: CreateCompanyPayload,
    token: string
  ): Promise<CreateCompanyResponse> {
    return apiClient.post<CreateCompanyResponse>(
      "/companies",
      companyData,
      token
    );
  }

  /**
   * Retrieves all companies
   */
  static async getAllCompanies(token?: string): Promise<Company[]> {
    return apiClient.get<Company[]>("/companies", token);
  }

  /**
   * Retrieves a company by its ID
   */
  static async getCompanyById(
    companyId: number,
    token?: string
  ): Promise<Company> {
    return apiClient.get<Company>(`/companies/${companyId}`, token);
  }

  /**
   * Retrieves the responsible person of a company by the company ID
   */
  static async getCompanyResponsibleById(
    companyId: number,
    token?: string
  ): Promise<GetResponsibleResponse> {
    return apiClient.get<GetResponsibleResponse>(
      `/companies/${companyId}/responsible`,
      token
    );
  }

  /**
   * Updates a company
   */
  static async updateCompany(
    companyId: number,
    companyData: UpdateCompanyPayload,
    token: string
  ): Promise<UpdateCompanyResponse> {
    return apiClient.put<UpdateCompanyResponse>(
      `/companies/${companyId}`,
      companyData,
      token
    );
  }

  /**
   * Deletes a company
   */
  static async deleteCompany(
    companyId: number,
    token: string
  ): Promise<DeleteCompanyResponse> {
    return apiClient.delete<DeleteCompanyResponse>(
      `/companies/${companyId}`,
      token
    );
  }

  // Utility methods

  /**
   * Checks if a company is active
   */
  static isCompanyActive(company: Company): boolean {
    return company.isActive;
  }

  /**
   * Checks if a company's membership is expired
   */
  static isMembershipExpired(company: Company): boolean {
    if (!company.dateEndMembership) return false;

    const endDate = new Date(company.dateEndMembership);
    const today = new Date();

    return endDate < today;
  }

  /**
   * Calculates the number of days remaining before membership expiry
   */
  static getDaysUntilMembershipExpiry(company: Company): number | null {
    if (!company.dateEndMembership) return null;

    const endDate = new Date(company.dateEndMembership);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Formats the full address of a company
   */
  static getFullAddress(company: Company): string {
    return `${company.street}, ${company.postalCode} ${company.city}`;
  }

  /**
   * Retrieves all social links of a company
   */
  static getSocialLinks(company: Company): Record<string, string> {
    const links: Record<string, string> = {};

    if (company.linkWebsite) links.website = company.linkWebsite;
    if (company.linkFacebook) links.facebook = company.linkFacebook;
    if (company.linkInstagram) links.instagram = company.linkInstagram;
    if (company.linkLinkedin) links.linkedin = company.linkLinkedin;
    if (company.linkTiktok) links.tiktok = company.linkTiktok;
    if (company.linkYoutube) links.youtube = company.linkYoutube;

    return links;
  }

  /**
   * Checks if a company has social links
   */
  static hasSocialLinks(company: Company): boolean {
    return !!(
      company.linkWebsite ||
      company.linkFacebook ||
      company.linkInstagram ||
      company.linkLinkedin ||
      company.linkTiktok ||
      company.linkYoutube
    );
  }

  /**
   * Filters active companies
   */
  static filterActiveCompanies(companies: Company[]): Company[] {
    return companies.filter((company) => company.isActive);
  }

  /**
   * Filters companies by city
   */
  static filterCompaniesByCity(companies: Company[], city: string): Company[] {
    return companies.filter(
      (company) => company.city.toLowerCase() === city.toLowerCase()
    );
  }

  /**
   * Filters companies by postal code
   */
  static filterCompaniesByPostalCode(
    companies: Company[],
    postalCode: string
  ): Company[] {
    return companies.filter((company) => company.postalCode === postalCode);
  }

  /**
   * Searches companies by name (case-insensitive)
   */
  static searchCompaniesByName(
    companies: Company[],
    searchTerm: string
  ): Company[] {
    const term = searchTerm.toLowerCase();
    return companies.filter((company) =>
      company.name.toLowerCase().includes(term)
    );
  }

  /**
   * Sorts companies by name (A-Z)
   */
  static sortCompaniesByName(companies: Company[]): Company[] {
    return [...companies].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Sorts companies by creation date (most recent first)
   */
  static sortCompaniesByCreationDate(companies: Company[]): Company[] {
    return [...companies].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Sorts companies by membership expiry date (soonest first)
   */
  static sortCompaniesByMembershipExpiry(companies: Company[]): Company[] {
    return [...companies].sort((a, b) => {
      if (!a.dateEndMembership && !b.dateEndMembership) return 0;
      if (!a.dateEndMembership) return 1;
      if (!b.dateEndMembership) return -1;

      return (
        new Date(a.dateEndMembership).getTime() -
        new Date(b.dateEndMembership).getTime()
      );
    });
  }

  /**
   * Retrieves companies whose membership expires soon (within X days)
   */
  static getCompaniesWithUpcomingExpiry(
    companies: Company[],
    daysThreshold: number = 30
  ): Company[] {
    return companies.filter((company) => {
      const daysUntilExpiry = this.getDaysUntilMembershipExpiry(company);
      return (
        daysUntilExpiry !== null &&
        daysUntilExpiry <= daysThreshold &&
        daysUntilExpiry > 0
      );
    });
  }

  /**
   * Retrieves companies with expired membership
   */
  static getExpiredMembershipCompanies(companies: Company[]): Company[] {
    return companies.filter((company) => this.isMembershipExpired(company));
  }

  /**
   * Validates company data before creation/update
   */
  static validateCompanyData(
    data: CreateCompanyPayload | UpdateCompanyPayload
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Name validation (required for creation)
    if ("name" in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push("Company name is required");
      } else if (data.name.length > 100) {
        errors.push("Company name cannot exceed 100 characters");
      }
    }

    // City validation
    if ("city" in data && data.city !== undefined) {
      if (!data.city || data.city.trim().length === 0) {
        errors.push("City is required");
      }
    }

    // Postal code validation
    if ("postalCode" in data && data.postalCode !== undefined) {
      if (!data.postalCode || data.postalCode.trim().length === 0) {
        errors.push("Postal code is required");
      } else if (!/^\d{5}$/.test(data.postalCode)) {
        errors.push("Postal code must be 5 digits");
      }
    }

    // Street validation
    if ("street" in data && data.street !== undefined) {
      if (!data.street || data.street.trim().length === 0) {
        errors.push("Address is required");
      }
    }

    // URL validation
    const urlFields = [
      "linkWebsite",
      "linkFacebook",
      "linkInstagram",
      "linkLinkedin",
      "linkTiktok",
      "linkYoutube",
    ];

    urlFields.forEach((field) => {
      if (field in data && data[field as keyof typeof data]) {
        const url = data[field as keyof typeof data] as string;
        try {
          new URL(url);
        } catch {
          errors.push(`${field} must be a valid URL`);
        }
      }
    });

    // Membership expiry date validation
    if ("dateEndMembership" in data && data.dateEndMembership) {
      const date = new Date(data.dateEndMembership);
      if (isNaN(date.getTime())) {
        errors.push("Membership end date must be a valid date");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formats a company for display in a list
   */
  static formatCompanyForList(company: Company): {
    id: number;
    name: string;
    city: string;
    isActive: boolean;
    responsible: string;
    membershipStatus: "active" | "expiring" | "expired";
  } {
    const responsibleName = `${company.responsible.firstName} ${company.responsible.lastName}`;

    let membershipStatus: "active" | "expiring" | "expired" = "active";
    if (this.isMembershipExpired(company)) {
      membershipStatus = "expired";
    } else {
      const daysUntilExpiry = this.getDaysUntilMembershipExpiry(company);
      if (daysUntilExpiry !== null && daysUntilExpiry <= 30) {
        membershipStatus = "expiring";
      }
    }

    return {
      id: company.id,
      name: company.name,
      city: company.city,
      isActive: company.isActive,
      responsible: responsibleName,
      membershipStatus,
    };
  }
}

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
   * Crée une nouvelle entreprise
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
   * Récupère toutes les entreprises
   */
  static async getAllCompanies(token?: string): Promise<Company[]> {
    return apiClient.get<Company[]>("/companies", token);
  }

  /**
   * Récupère une entreprise par son ID
   */
  static async getCompanyById(
    companyId: number,
    token?: string
  ): Promise<Company> {
    return apiClient.get<Company>(`/companies/${companyId}`, token);
  }

  /**
   * Récupère le responsable d'une entreprise par l'ID de l'entreprise
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
   * Met à jour une entreprise
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
   * Supprime une entreprise
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

  // Méthodes utilitaires

  /**
   * Vérifie si une entreprise est active
   */
  static isCompanyActive(company: Company): boolean {
    return company.isActive;
  }

  /**
   * Vérifie si l'adhésion d'une entreprise est expirée
   */
  static isMembershipExpired(company: Company): boolean {
    if (!company.dateEndMembership) return false;

    const endDate = new Date(company.dateEndMembership);
    const today = new Date();

    return endDate < today;
  }

  /**
   * Calcule le nombre de jours restants avant l'expiration de l'adhésion
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
   * Formate l'adresse complète d'une entreprise
   */
  static getFullAddress(company: Company): string {
    return `${company.street}, ${company.postalCode} ${company.city}`;
  }

  /**
   * Récupère tous les liens sociaux d'une entreprise
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
   * Vérifie si une entreprise a des liens sociaux
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
   * Filtre les entreprises actives
   */
  static filterActiveCompanies(companies: Company[]): Company[] {
    return companies.filter((company) => company.isActive);
  }

  /**
   * Filtre les entreprises par ville
   */
  static filterCompaniesByCity(companies: Company[], city: string): Company[] {
    return companies.filter(
      (company) => company.city.toLowerCase() === city.toLowerCase()
    );
  }

  /**
   * Filtre les entreprises par code postal
   */
  static filterCompaniesByPostalCode(
    companies: Company[],
    postalCode: string
  ): Company[] {
    return companies.filter((company) => company.postalCode === postalCode);
  }

  /**
   * Recherche des entreprises par nom (insensible à la casse)
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
   * Trie les entreprises par nom (A-Z)
   */
  static sortCompaniesByName(companies: Company[]): Company[] {
    return [...companies].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Trie les entreprises par date de création (plus récent en premier)
   */
  static sortCompaniesByCreationDate(companies: Company[]): Company[] {
    return [...companies].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Trie les entreprises par date d'expiration d'adhésion (plus proche en premier)
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
   * Récupère les entreprises dont l'adhésion expire bientôt (dans les X jours)
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
   * Récupère les entreprises avec adhésion expirée
   */
  static getExpiredMembershipCompanies(companies: Company[]): Company[] {
    return companies.filter((company) => this.isMembershipExpired(company));
  }

  /**
   * Valide les données d'une entreprise avant création/mise à jour
   */
  static validateCompanyData(
    data: CreateCompanyPayload | UpdateCompanyPayload
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validation du nom (requis pour la création)
    if ("name" in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push("Le nom de l'entreprise est requis");
      } else if (data.name.length > 100) {
        errors.push(
          "Le nom de l'entreprise ne peut pas dépasser 100 caractères"
        );
      }
    }

    // Validation de la ville
    if ("city" in data && data.city !== undefined) {
      if (!data.city || data.city.trim().length === 0) {
        errors.push("La ville est requise");
      }
    }

    // Validation du code postal
    if ("postalCode" in data && data.postalCode !== undefined) {
      if (!data.postalCode || data.postalCode.trim().length === 0) {
        errors.push("Le code postal est requis");
      } else if (!/^\d{5}$/.test(data.postalCode)) {
        errors.push("Le code postal doit contenir 5 chiffres");
      }
    }

    // Validation de la rue
    if ("street" in data && data.street !== undefined) {
      if (!data.street || data.street.trim().length === 0) {
        errors.push("L'adresse est requise");
      }
    }

    // Validation des URLs
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
          errors.push(`${field} doit être une URL valide`);
        }
      }
    });

    // Validation de la date d'expiration
    if ("dateEndMembership" in data && data.dateEndMembership) {
      const date = new Date(data.dateEndMembership);
      if (isNaN(date.getTime())) {
        errors.push("La date de fin d'adhésion doit être une date valide");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formate une entreprise pour l'affichage dans une liste
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

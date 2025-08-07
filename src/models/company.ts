// models/Company.ts
import { User } from "./user";
import { File } from "./file";

export interface Company {
  id: number;
  responsible: User;
  responsibleId: number;
  name: string;
  fileImageCompany?: File;
  description?: string;
  dateEndMembership?: string;
  city: string;
  postalCode: string;
  street: string;
  linkWebsite?: string;
  linkFacebook?: string;
  linkInstagram?: string;
  linkLinkedin?: string;
  linkTiktok?: string;
  linkYoutube?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyPayload {
  responsibleId: number | null;
  name: string;
  description?: string;
  dateEndMembership?: string;
  city: string;
  postalCode: string;
  street: string;
  fileImageCompany?: File;
  linkWebsite?: string;
  linkFacebook?: string;
  linkInstagram?: string;
  linkLinkedin?: string;
  linkTiktok?: string;
  linkYoutube?: string;
}

export interface UpdateCompanyPayload extends Partial<CreateCompanyPayload> {
  isActive?: boolean;
}

export interface CreateCompanyResponse {
  message: string;
  company: Company;
}

export interface UpdateCompanyResponse {
  message: string;
  company: Company;
}

export interface DeleteCompanyResponse {
  message: string;
}

export interface GetResponsibleResponse {
  responsible: User;
}

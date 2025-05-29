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

// Payload pour création d'entreprise
export interface CreateCompanyPayload {
  responsibleId: number;
  name: string;
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
}

// Payload pour mise à jour d'entreprise
export interface UpdateCompanyPayload extends Partial<CreateCompanyPayload> {
  isActive?: boolean;
}

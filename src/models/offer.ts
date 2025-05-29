import { Company } from "./company";

export enum OfferCategory {
  DISCOUNT = "discount",
  SPONSORSHIP = "sponsorship",
}

export interface Offer {
  id: number;
  company: Company;
  companyId: number;
  offerCategory: OfferCategory;
  title: string;
  description: string;
  conditions: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountOffer {
  id: number;
  offer: Offer;
  amount: number;
  link: string | null;
}

export interface SponsorshipOffer {
  id: number;
  offer: Offer;
  nbPersonMax: number;
  personOngoingIds: string | null;
}

export type OfferWithDetails =
  | (Offer & { discountDetails: DiscountOffer })
  | (Offer & { sponsorshipDetails: SponsorshipOffer });

export interface CreateOffer {
  companyId: number;
  offerCategory: OfferCategory;
  title: string;
  description: string;
  conditions?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface CreateDiscountOffer {
  amount: number;
  link?: string;
}

export interface CreateSponsorshipOffer {
  nbPersonMax: number;
  personOngoingIds?: string;
}

export interface CreateOfferWithDiscount extends CreateOffer {
  offerCategory: OfferCategory.DISCOUNT;
  discountDetails: CreateDiscountOffer;
}

export interface CreateOfferWithSponsorship extends CreateOffer {
  offerCategory: OfferCategory.SPONSORSHIP;
  sponsorshipDetails: CreateSponsorshipOffer;
}

export type CreateOfferComplete =
  | CreateOfferWithDiscount
  | CreateOfferWithSponsorship;

export interface UpdateOffer {
  id: number;
  companyId?: number;
  offerCategory?: OfferCategory;
  title?: string;
  description?: string;
  conditions?: string | null;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateDiscountOffer {
  id: number;
  amount?: number;
  link?: string | null;
}

export interface UpdateSponsorshipOffer {
  id: number;
  nbPersonMax?: number;
  personOngoingIds?: string | null;
}

export interface OfferResponse {
  id: number;
  companyId: number;
  offerCategory: OfferCategory;
  title: string;
  description: string;
  conditions: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountOfferResponse {
  id: number;
  amount: number;
  link: string | null;
}

export interface SponsorshipOfferResponse {
  id: number;
  nbPersonMax: number;
  personOngoingIds: string | null;
}

export interface OfferWithDiscountResponse extends OfferResponse {
  offerCategory: OfferCategory.DISCOUNT;
  discountDetails: DiscountOfferResponse;
}

export interface OfferWithSponsorshipResponse extends OfferResponse {
  offerCategory: OfferCategory.SPONSORSHIP;
  sponsorshipDetails: SponsorshipOfferResponse;
}

export type OfferCompleteResponse =
  | OfferWithDiscountResponse
  | OfferWithSponsorshipResponse;

export const mapOfferResponse = (
  response: OfferResponse,
  company: Company
): Offer => ({
  id: response.id,
  company,
  companyId: response.companyId,
  offerCategory: response.offerCategory,
  title: response.title,
  description: response.description,
  conditions: response.conditions,
  startDate: new Date(response.startDate).toString(),
  endDate: new Date(response.endDate).toString(),
  isActive: response.isActive,
  createdAt: new Date(response.createdAt).toString(),
  updatedAt: new Date(response.updatedAt).toString(),
});

export const mapDiscountOfferResponse = (
  response: DiscountOfferResponse,
  offer: Offer
): DiscountOffer => ({
  id: response.id,
  offer,
  amount: response.amount,
  link: response.link,
});

export const mapSponsorshipOfferResponse = (
  response: SponsorshipOfferResponse,
  offer: Offer
): SponsorshipOffer => ({
  id: response.id,
  offer,
  nbPersonMax: response.nbPersonMax,
  personOngoingIds: response.personOngoingIds,
});

export const isDiscountOffer = (
  offer: OfferCompleteResponse
): offer is OfferWithDiscountResponse => {
  return offer.offerCategory === OfferCategory.DISCOUNT;
};

export const isSponsorshipOffer = (
  offer: OfferCompleteResponse
): offer is OfferWithSponsorshipResponse => {
  return offer.offerCategory === OfferCategory.SPONSORSHIP;
};

export const DEFAULT_OFFER_VALUES = {
  isActive: true,
} as const;

export const parsePersonOngoingIds = (ids: string | null): number[] => {
  if (!ids) return [];
  try {
    return JSON.parse(ids);
  } catch {
    return ids
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));
  }
};

export const stringifyPersonOngoingIds = (ids: number[]): string => {
  return JSON.stringify(ids);
};

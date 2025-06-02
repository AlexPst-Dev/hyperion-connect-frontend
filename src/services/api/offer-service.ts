import { apiClient } from "./client";
import {
  CreateOfferComplete,
  UpdateOffer,
  UpdateDiscountOffer,
  UpdateSponsorshipOffer,
  OfferCompleteResponse,
  OfferCategory,
  OfferResponse,
  DiscountOfferResponse,
  SponsorshipOfferResponse,
} from "../../models/offer";

// Interface for enrich backend response (with specificOffer)
interface EnrichedOfferResponse extends OfferResponse {
  specificOffer: DiscountOfferResponse | SponsorshipOfferResponse | null;
}

export class OffersApiService {
  private static readonly ENDPOINTS = {
    OFFERS: "/offers",
    OFFER_BY_ID: (id: number) => `/offers/${id}`,
    OFFERS_BY_COMPANY: (companyId: number) => `/offers/company/${companyId}`,
    OFFERS_BY_COMPANY_AND_CATEGORY: (
      companyId: number,
      category: OfferCategory
    ) => `/offers/company/${companyId}/category/${category}`,
  } as const;

  /**
   * Create a new offer (discount or sponsorship)
   */
  static async createOffer(
    offerData: CreateOfferComplete,
    token: string
  ): Promise<{ message: string }> {
    const payload = this.prepareCreateOfferPayload(offerData);

    return apiClient.post<{ message: string }>(
      this.ENDPOINTS.OFFERS,
      payload,
      token
    );
  }

  /**
   * Find all offers
   */
  static async getAllOffers(token?: string): Promise<OfferCompleteResponse[]> {
    const enrichedOffers = await apiClient.get<EnrichedOfferResponse[]>(
      this.ENDPOINTS.OFFERS,
      token
    );

    return this.transformEnrichedOffersToCompleteResponse(enrichedOffers);
  }

  /**
   * Find one offer by it's id
   */
  static async getOfferById(
    id: number,
    token?: string
  ): Promise<OfferCompleteResponse> {
    const enrichedOffer = await apiClient.get<EnrichedOfferResponse>(
      this.ENDPOINTS.OFFER_BY_ID(id),
      token
    );

    return this.transformEnrichedOfferToCompleteResponse(enrichedOffer);
  }

  /**
   * Find all offers of a company
   */
  static async getOffersByCompanyId(
    companyId: number,
    token?: string
  ): Promise<OfferCompleteResponse[]> {
    const enrichedOffers = await apiClient.get<EnrichedOfferResponse[]>(
      this.ENDPOINTS.OFFERS_BY_COMPANY(companyId),
      token
    );

    return this.transformEnrichedOffersToCompleteResponse(enrichedOffers);
  }

  /**
   * Find all offers by company and category
   */
  static async getOffersByCompanyIdAndCategory(
    companyId: number,
    category: OfferCategory,
    token?: string
  ): Promise<OfferResponse[]> {
    return apiClient.get<OfferResponse[]>(
      this.ENDPOINTS.OFFERS_BY_COMPANY_AND_CATEGORY(companyId, category),
      token
    );
  }

  /**
   * Update offer
   */
  static async updateOffer(
    id: number,
    updateData: Partial<
      UpdateOffer & UpdateDiscountOffer & UpdateSponsorshipOffer
    >,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      this.ENDPOINTS.OFFER_BY_ID(id),
      updateData,
      token
    );
  }

  /**
   * Delete offer
   */
  static async deleteOffer(
    id: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      this.ENDPOINTS.OFFER_BY_ID(id),
      token
    );
  }

  // Private utility methods

  /**
   * Prepares the payload for offer creation according to the format expected by the backend
   */
  private static prepareCreateOfferPayload(
    offerData: CreateOfferComplete
  ): any {
    const basePayload = {
      companyId: offerData.companyId,
      offerCategory: offerData.offerCategory,
      title: offerData.title,
      description: offerData.description,
      conditions: offerData.conditions,
      startDate: offerData.startDate,
      endDate: offerData.endDate,
      isActive: offerData.isActive ?? true,
    };

    if (offerData.offerCategory === OfferCategory.DISCOUNT) {
      return {
        ...basePayload,
        amount: offerData.discountDetails.amount,
        link: offerData.discountDetails.link,
      };
    } else {
      return {
        ...basePayload,
        nbPersonMax: offerData.sponsorshipDetails.nbPersonMax,
        personOngoingIds: offerData.sponsorshipDetails.personOngoingIds,
      };
    }
  }

  /**
   * Transforms a list of enriched offers into complete answers
   */
  private static transformEnrichedOffersToCompleteResponse(
    enrichedOffers: EnrichedOfferResponse[]
  ): OfferCompleteResponse[] {
    return enrichedOffers.map((offer) =>
      this.transformEnrichedOfferToCompleteResponse(offer)
    );
  }

  /**
   * Transforms an enriched offer into a complete response
   */
  private static transformEnrichedOfferToCompleteResponse(
    enrichedOffer: EnrichedOfferResponse
  ): OfferCompleteResponse {
    const { specificOffer, ...baseOffer } = enrichedOffer;

    if (baseOffer.offerCategory === OfferCategory.DISCOUNT) {
      return {
        ...baseOffer,
        offerCategory: OfferCategory.DISCOUNT,
        discountDetails: specificOffer as DiscountOfferResponse,
      };
    } else {
      return {
        ...baseOffer,
        offerCategory: OfferCategory.SPONSORSHIP,
        sponsorshipDetails: specificOffer as SponsorshipOfferResponse,
      };
    }
  }
}

// Export individual methods for more flexibility
export const {
  createOffer,
  getAllOffers,
  getOfferById,
  getOffersByCompanyId,
  getOffersByCompanyIdAndCategory,
  updateOffer,
  deleteOffer,
} = OffersApiService;

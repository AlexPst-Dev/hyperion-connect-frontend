import { OffersApiService } from "@/src/services/api/offer-service";
import { OfferCategory, OfferCompleteResponse } from "@/src/models/offer";
import { Company } from "../models/company";
import { Category } from "../models/category";

export async function fetchOffersByClientCompany(
  client: any,
  token: string
): Promise<OfferCompleteResponse[]> {
  const companyId = client?.profile?.companyId || client?.companyId;
  if (!companyId) return [];
  return OffersApiService.getOffersByCompanyId(companyId, token);
}

export interface OfferFormData {
  title: string;
  description: string;
  conditions: string;
  startDate: string;
  endDate: string;
  discountAmount?: string; // Only for DISCOUNT
  discountLink?: string; // Only for DISCOUNT
  sponsorshipNbPersonMax?: string; // Only for SPONSORSHIP
  sponsorshipSportCategory?: string; // Only for SPONSORSHIP
}

export async function handleCreateOffer(
  company: Company,
  token: string,
  newOfferType: OfferCategory.DISCOUNT | OfferCategory.SPONSORSHIP,
  offerForm: OfferFormData,
  sportCategories: Category[]
): Promise<OfferCompleteResponse> {
  if (!company?.id || !token) throw new Error("Missing company or token");

  let conditions = offerForm.conditions;

  // If sponsorship, prepend sport label
  if (
    newOfferType === OfferCategory.SPONSORSHIP &&
    offerForm.sponsorshipSportCategory &&
    sportCategories
  ) {
    const sport = sportCategories.find(
      (cat) => String(cat.id) === offerForm.sponsorshipSportCategory
    );
    if (sport) {
      conditions = `[${sport.label}] - ${conditions}`;
    }
  }

  let payload: any = {
    companyId: company.id,
    offerCategory: newOfferType,
    title: offerForm.title,
    description: offerForm.description,
    conditions, // use the modified string
    startDate: offerForm.startDate,
    endDate: offerForm.endDate,
    isActive: true,
  };

  if (newOfferType === OfferCategory.DISCOUNT) {
    payload = {
      ...payload,
      discountDetails: {
        amount: Number(offerForm.discountAmount),
        link: offerForm.discountLink,
      },
    };
  } else {
    payload = {
      ...payload,
      sponsorshipDetails: {
        nbPersonMax: Number(offerForm.sponsorshipNbPersonMax),
        personOngoingIds: "[]",
      },
    };
  }

  await OffersApiService.createOffer(payload, token);
  return payload;
}

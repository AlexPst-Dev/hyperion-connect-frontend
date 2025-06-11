import { useEffect, useState } from "react";
import { OffersApiService } from "@/src/services/api/offer-service";
import { OfferCompleteResponse } from "@/src/models/offer";

export function useCompanyOffers(
  companyId: number | undefined,
  token: string | undefined
) {
  const [offers, setOffers] = useState<OfferCompleteResponse[]>([]);
  const [companyOffersLoading, setCompanyOffersLoading] = useState(false);
  const [errorCompanyOffers, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId || !token) return;
    let isMounted = true;
    setCompanyOffersLoading(true);
    setError(null);

    OffersApiService.getOffersByCompanyId(companyId, token)
      .then((data) => {
        if (isMounted) setOffers(data);
      })
      .catch((e) => {
        if (isMounted)
          setError(e.message || "Erreur lors du chargement des offres.");
      })
      .finally(() => {
        if (isMounted) setCompanyOffersLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [companyId, token]);

  return { offers, companyOffersLoading, errorCompanyOffers };
}

export function useInactiveCompanyOffers(companyId: number, token?: string) {
  const [offers, setOffers] = useState<OfferCompleteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId || !token) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    OffersApiService.getOffersByCompanyId(companyId, token)
      .then((allOffers) => {
        if (!isMounted) return;
        setOffers(allOffers.filter((offer) => offer.isActive === false));
      })
      .catch((e) => {
        if (isMounted) setError(e.message || "Erreur lors du chargement.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [companyId, token]);

  return { offers, loading, error };
}

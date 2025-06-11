import { useEffect, useState } from "react";
import { User, PartnerProfile } from "../models/user";
import { Company } from "../models/company";
import { UserService } from "../services/api/user-service";
import { CompanyService } from "../services/api/company-service";

interface UsePartnerAndCompanyResult {
  partner: User | null;
  company: Company | null;
  partnerAndCompanyLoading: boolean;
  error: string | null;
}

/**
 * Fetches a partner user and their company info.
 * @param partnerId The user id of the partner
 * @param token Auth token
 */
export function usePartnerAndCompany(
  partnerId: number | undefined,
  token: string | undefined
): UsePartnerAndCompanyResult {
  const [partner, setPartner] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [partnerAndCompanyLoading, setPartnerAndCompanyLoading] =
    useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerId || !token) return;
    let isMounted = true;
    setPartnerAndCompanyLoading(true);
    setError(null);

    async function fetchPartnerAndCompany() {
      try {
        const response = await UserService.getUserById(
          partnerId as number,
          token
        );
        const user = { ...response.user, profile: response.profile }; // Attach profile
        if (!isMounted) return;
        setPartner(user);

        // Get companyId from partner profile
        const companyId = (user.profile as PartnerProfile)?.companyId;
        if (companyId) {
          const companyData = await CompanyService.getCompanyById(
            companyId,
            token
          );
          if (!isMounted) return;
          setCompany(companyData);
        } else {
          setCompany(null);
        }
      } catch (e: any) {
        if (isMounted) setError(e.message || "Erreur lors du chargement.");
      } finally {
        if (isMounted) setPartnerAndCompanyLoading(false);
      }
    }

    fetchPartnerAndCompany();
    return () => {
      isMounted = false;
    };
  }, [partnerId, token]);

  return { partner, company, partnerAndCompanyLoading, error };
}

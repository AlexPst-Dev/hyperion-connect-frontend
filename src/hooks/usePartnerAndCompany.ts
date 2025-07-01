import { useEffect, useState } from "react";
import { UserResponse } from "../models/user";
import { Company } from "../models/company";
import { UserService } from "../services/api/user-service";
import { CompanyService } from "../services/api/company-service";

interface UsePartnerAndCompanyResult {
  partner: UserResponse | null;
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
  const [partner, setPartner] = useState<UserResponse | null>(null);
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
        const completeUser = await UserService.getUserById(
          partnerId as number,
          token
        );
        if (!isMounted) return;
        setPartner(completeUser);
        const allCompanies = await CompanyService.getAllCompanies(token);
        const companyData = allCompanies.filter(
          (c) => c.responsibleId === completeUser.user.id
        )[0];
        if (!isMounted) return;
        setCompany(companyData);
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

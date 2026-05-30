import {
  alertService,
  authService,
  caisseService,
  chantierService,
  dashboardService,
  documentService,
  enginsService,
  fournisseurService,
  gasoilService,
  personnelService,
  productionService,
  validationService,
} from "@/services/mock-api";
import { backendApi, backendAuthService } from "./backend-api";
import { isBackendEnabled } from "./api-client";

export const dataSource = isBackendEnabled()
  ? {
      ...backendApi,
      authService: backendAuthService,
    }
  : {
      chantierService,
      dashboardService,
      caisseService,
      gasoilService,
      personnelService,
      enginsService,
      productionService,
      validationService,
      alertService,
      documentService,
      fournisseurService,
      authService,
    };

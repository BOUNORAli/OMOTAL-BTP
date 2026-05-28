import {
  alertService,
  authService,
  caisseService,
  chantierService,
  dashboardService,
  enginsService,
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
      authService,
    };

import {
  alertService,
  authService,
  caisseService,
  chantierService,
  dashboardService,
  documentService,
  enginsService,
  entretienService,
  etpService,
  exportService,
  fournisseurService,
  gasoilService,
  importService,
  referentielService,
  matieresService,
  personnelService,
  productionService,
  bqService,
  transportService,
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
      matieresService,
      etpService,
      transportService,
      entretienService,
      bqService,
      importService,
      validationService,
      alertService,
      documentService,
      fournisseurService,
      exportService,
      referentielService,
      authService,
    };

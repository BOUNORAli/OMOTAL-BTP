package ma.omotal.service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.MathContext;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.GasoilEntryEntity;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.ImportBatchEntity;
import ma.omotal.domain.ImportRowEntity;
import ma.omotal.domain.ProductionRecordEntity;
import ma.omotal.domain.SupplierEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.PaymentMode;
import ma.omotal.domain.enums.ProductionFamily;
import ma.omotal.domain.enums.SupplierType;
import ma.omotal.domain.enums.TransactionCategory;
import ma.omotal.domain.enums.TransactionType;
import ma.omotal.repository.CaisseTransactionRepository;
import ma.omotal.repository.GasoilEntryRepository;
import ma.omotal.repository.GasoilExitRepository;
import ma.omotal.repository.ImportBatchRepository;
import ma.omotal.repository.ImportRowRepository;
import ma.omotal.repository.ProductionRecordRepository;
import ma.omotal.repository.SupplierRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ControlledImportService {
  private static final List<String> EXCEL_ERRORS = List.of("#REF!", "#VALUE!", "#DIV/0!", "#NAME?", "#N/A");

  private final ImportBatchRepository batches;
  private final ImportRowRepository rows;
  private final ProductionRecordRepository productions;
  private final GasoilEntryRepository gasoilEntries;
  private final GasoilExitRepository gasoilExits;
  private final SupplierRepository suppliers;
  private final CaisseTransactionRepository transactions;
  private final ReferenceService references;
  private final DataFormatter formatter = new DataFormatter(Locale.FRANCE);

  public ControlledImportService(
      ImportBatchRepository batches,
      ImportRowRepository rows,
      ProductionRecordRepository productions,
      GasoilEntryRepository gasoilEntries,
      GasoilExitRepository gasoilExits,
      SupplierRepository suppliers,
      CaisseTransactionRepository transactions,
      ReferenceService references
  ) {
    this.batches = batches;
    this.rows = rows;
    this.productions = productions;
    this.gasoilEntries = gasoilEntries;
    this.gasoilExits = gasoilExits;
    this.suppliers = suppliers;
    this.transactions = transactions;
    this.references = references;
  }

  public CoreDtos.ImportWorkbookPreviewDto preview(MultipartFile file, String workbookRole) throws Exception {
    try (var workbook = WorkbookFactory.create(file.getInputStream())) {
      var sheets = new ArrayList<CoreDtos.ImportSheetPreviewDto>();
      var errors = new ArrayList<String>();
      for (var index = 0; index < workbook.getNumberOfSheets(); index++) {
        sheets.add(analyzeSheet(workbook.getSheetAt(index)));
      }
      return new CoreDtos.ImportWorkbookPreviewDto(
          file.getOriginalFilename(),
          role(workbookRole),
          workbook.getNumberOfSheets(),
          sheets.stream().mapToInt(CoreDtos.ImportSheetPreviewDto::dataRows).sum(),
          sheets.stream().mapToInt(CoreDtos.ImportSheetPreviewDto::validRows).sum(),
          sheets.stream().mapToInt(CoreDtos.ImportSheetPreviewDto::warningRows).sum(),
          sheets.stream().mapToInt(CoreDtos.ImportSheetPreviewDto::blockedRows).sum(),
          sheets,
          errors
      );
    }
  }

  public CoreDtos.ImportCommitDto commit(MultipartFile file, UUID chantierId, String workbookRole, UUID userId) throws Exception {
    var preview = preview(file, workbookRole);
    var batch = new ImportBatchEntity();
    batch.setChantierId(chantierId);
    batch.setFileName(file.getOriginalFilename() == null ? "import.xlsx" : file.getOriginalFilename());
    batch.setWorkbookRole(preview.workbookRole());
    batch.setStatus(preview.blockedRows() > 0 ? "COMMITTED_WITH_ISSUES" : "COMMITTED");
    batch.setTotalSheets(preview.sheetCount());
    batch.setTotalRows(preview.totalRows());
    batch.setValidRows(preview.validRows());
    batch.setWarningRows(preview.warningRows());
    batch.setBlockedRows(preview.blockedRows());
    batch.setCommittedAt(OffsetDateTime.now());
    batch.setCreatedByUserId(userId);
    var savedBatch = batches.save(batch);

    var imported = 0;
    try (InputStream stream = file.getInputStream(); var workbook = WorkbookFactory.create(stream)) {
      for (var index = 0; index < workbook.getNumberOfSheets(); index++) {
        imported += commitSheet(workbook.getSheetAt(index), chantierId, userId, savedBatch.getId());
      }
    }
    return new CoreDtos.ImportCommitDto(
        savedBatch.getId(),
        chantierId,
        savedBatch.getFileName(),
        savedBatch.getWorkbookRole(),
        savedBatch.getStatus(),
        savedBatch.getTotalRows(),
        savedBatch.getValidRows(),
        savedBatch.getWarningRows(),
        savedBatch.getBlockedRows(),
        imported
    );
  }

  public CoreDtos.ImportBatchDto getBatch(UUID batchId) {
    return batches.findById(batchId).map(ma.omotal.api.Mapper::importBatch)
        .orElseThrow(() -> new IllegalArgumentException("Import introuvable."));
  }

  public List<CoreDtos.ImportRowDto> getIssues(UUID batchId) {
    return rows.findByBatchIdOrderBySheetNameAscSourceRowNumberAsc(batchId).stream()
        .filter(row -> !"OK".equals(row.getSeverity()))
        .map(ma.omotal.api.Mapper::importRow)
        .toList();
  }

  private CoreDtos.ImportSheetPreviewDto analyzeSheet(Sheet sheet) {
    var module = detectModule(sheet.getSheetName());
    var headerRow = headerRow(module);
    var headers = headers(sheet, headerRow);
    var issues = new ArrayList<CoreDtos.ImportIssueDto>();
    var samples = new ArrayList<List<String>>();
    var metrics = new HashMap<String, BigDecimal>();
    var rowsCount = 0;
    var validRows = 0;
    var warningRows = 0;
    var blockedRows = 0;

    for (int i = headerRow; i <= sheet.getLastRowNum(); i++) {
      var row = sheet.getRow(i);
      if (row == null || blankRow(row)) {
        continue;
      }
      if (!isDataRow(module, row)) {
        continue;
      }
      rowsCount++;
      if (samples.size() < 5) {
        samples.add(rowValues(row, Math.max(headers.size(), 12)));
      }
      var rowIssues = rowIssues(sheet, row, module);
      issues.addAll(rowIssues);
      if (rowIssues.stream().anyMatch(issue -> "CRITICAL".equals(issue.severity()))) {
        blockedRows++;
      } else if (rowIssues.isEmpty()) {
        validRows++;
      } else {
        warningRows++;
      }
      collectMetrics(metrics, module, row);
    }

    return new CoreDtos.ImportSheetPreviewDto(
        sheet.getSheetName(),
        module,
        headerRow + 1,
        headers,
        rowsCount,
        validRows,
        warningRows,
        blockedRows,
        issues.stream().limit(80).toList(),
        metrics.entrySet().stream()
            .map(entry -> new CoreDtos.ImportMetricDto(entry.getKey(), entry.getValue(), metricUnit(entry.getKey())))
            .toList(),
        samples
    );
  }

  private int commitSheet(Sheet sheet, UUID chantierId, UUID userId, UUID batchId) {
    var module = detectModule(sheet.getSheetName());
    var headerRow = headerRow(module);
    var imported = 0;
    for (int i = headerRow; i <= sheet.getLastRowNum(); i++) {
      var row = sheet.getRow(i);
      if (row == null || blankRow(row) || !isDataRow(module, row)) {
        continue;
      }
      var issues = rowIssues(sheet, row, module);
      var critical = issues.stream().anyMatch(issue -> "CRITICAL".equals(issue.severity()));
      var importRow = new ImportRowEntity();
      importRow.setBatchId(batchId);
      importRow.setChantierId(chantierId);
      importRow.setSheetName(sheet.getSheetName());
      importRow.setModule(module);
      importRow.setSourceRowNumber(i + 1);
      importRow.setSeverity(critical ? "CRITICAL" : issues.isEmpty() ? "OK" : "WARNING");
      importRow.setErrors(String.join(" | ", issues.stream().map(CoreDtos.ImportIssueDto::message).toList()));
      importRow.setRawValues(String.join(";", rowValues(row, Math.min(row.getLastCellNum(), 32))));
      importRow.setDetectedKey(detectedKey(module, row));
      importRow.setRowStatus(critical ? "BLOCKED" : "IMPORTED");

      if (!critical) {
        var target = importTarget(module, row, chantierId, userId);
        if (target != null) {
          importRow.setImportedTargetType(target.type());
          importRow.setImportedTargetId(target.id());
          imported++;
        }
      }
      rows.save(importRow);
    }
    return imported;
  }

  private ImportedTarget importTarget(String module, Row row, UUID chantierId, UUID userId) {
    return switch (module) {
      case "GASOIL_ENTRY" -> importGasoilEntry(row, chantierId, userId);
      case "GASOIL_EXIT" -> importGasoilExit(row, chantierId, userId);
      case "CAISSE" -> importTransaction(row, chantierId, userId);
      case "PRODUCTION_DECAPAGE", "PRODUCTION_REGLAGE", "CANA_TRANCHEE", "CANA_POSE" -> importProduction(module, row, chantierId, userId);
      default -> null;
    };
  }

  private ImportedTarget importGasoilEntry(Row row, UUID chantierId, UUID userId) {
    var receipt = text(row, 5);
    if (!receipt.isBlank() && gasoilEntries.findByChantierIdAndReceiptNumber(chantierId, receipt).isPresent()) {
      return null;
    }
    var item = new GasoilEntryEntity();
    item.setChantierId(chantierId);
    item.setDate(date(row, 0));
    item.setSupplierId(supplier(text(row, 1), SupplierType.STATION).getId());
    item.setLiters(number(row, 2));
    item.setUnitPrice(number(row, 3));
    item.setReceiptNumber(receipt.isBlank() ? null : receipt);
    item.setStatus(OperationStatus.VALIDE);
    item.setEnteredByUserId(userId);
    var saved = gasoilEntries.save(item);
    references.getOrCreate(chantierId, "FOURNISSEUR", text(row, 1));
    return new ImportedTarget("GasoilEntry", saved.getId());
  }

  private ImportedTarget importGasoilExit(Row row, UUID chantierId, UUID userId) {
    var exitNumber = text(row, 2);
    if (!exitNumber.isBlank() && gasoilExits.findByChantierIdAndExitNumber(chantierId, exitNumber).isPresent()) {
      return null;
    }
    var liters = number(row, 7);
    var unitPrice = number(row, 8);
    if (unitPrice == null || BigDecimal.ZERO.compareTo(unitPrice) == 0) {
      var amount = number(row, 9);
      unitPrice = amount == null || liters == null || liters.compareTo(BigDecimal.ZERO) == 0
          ? BigDecimal.ONE
          : amount.divide(liters, MathContext.DECIMAL64);
    }
    var item = new GasoilExitEntity();
    item.setChantierId(chantierId);
    item.setDate(date(row, 3));
    item.setResponsible(blank(text(row, 10), "Non renseigne"));
    item.setAllocation(allocation(text(row, 4)));
    item.setLiters(liters);
    item.setUnitPrice(unitPrice);
    item.setExitNumber(exitNumber.isBlank() ? null : exitNumber);
    item.setStatus(OperationStatus.VALIDE);
    item.setEnteredByUserId(userId);
    var saved = gasoilExits.save(item);
    references.getOrCreate(chantierId, "AFFECTATION_GASOIL", text(row, 4));
    references.getOrCreate(chantierId, "CHAUFFEUR", blank(text(row, 10), "Non renseigne"));
    return new ImportedTarget("GasoilExit", saved.getId());
  }

  private ImportedTarget importTransaction(Row row, UUID chantierId, UUID userId) {
    var debit = number(row, 4);
    var credit = number(row, 5);
    if ((debit == null || debit.compareTo(BigDecimal.ZERO) == 0) && (credit == null || credit.compareTo(BigDecimal.ZERO) == 0)) {
      return null;
    }
    var item = new CaisseTransactionEntity();
    item.setChantierId(chantierId);
    item.setDate(date(row, 0));
    item.setType(credit != null && credit.compareTo(BigDecimal.ZERO) > 0 ? TransactionType.CREDIT : TransactionType.DEBIT);
    item.setAmount(item.getType() == TransactionType.CREDIT ? credit : debit);
    item.setPaymentMode(PaymentMode.ESPECES_OMOTAL);
    item.setCategory(item.getType() == TransactionType.CREDIT ? TransactionCategory.FINANCEMENT : TransactionCategory.DIVERS);
    item.setDescription(blank(text(row, 3), "Import Excel caisse"));
    item.setPersonOrSupplier(text(row, 1));
    item.setStatus(OperationStatus.VALIDE);
    item.setHasDocument(false);
    item.setEnteredByUserId(userId);
    var saved = transactions.save(item);
    return new ImportedTarget("CaisseTransaction", saved.getId());
  }

  private ImportedTarget importProduction(String module, Row row, UUID chantierId, UUID userId) {
    var item = new ProductionRecordEntity();
    item.setChantierId(chantierId);
    item.setStatus(OperationStatus.VALIDE);
    item.setEnteredByUserId(userId);
    item.setProductionFamily(family(module));
    item.setDate(date(row, 0));
    item.setVoie(blank(text(row, 1), "Non renseigne"));
    item.setTranche(text(row, 2));
    item.setTroncon(text(row, 3));
    item.setEquipmentId(null);
    item.setDriver(text(row, 5));
    item.setWorkType(blank(text(row, 6), family(module).name()));
    if ("PRODUCTION_DECAPAGE".equals(module)) {
      item.setDepthValue(number(row, 7));
      item.setLengthValue(number(row, 8));
      item.setWidthValue(number(row, 9));
      item.setHours(first(number(row, 10), number(row, 14)));
      item.setQuantity(first(number(row, 11), CalculationService.calculateProductionQuantity("M3", item.getLengthValue(), item.getWidthValue(), item.getDepthValue(), null)));
      item.setUnit("M3");
      item.setAllocatedGasoilLiters(number(row, 17));
      item.setAllocatedGasoilAmount(number(row, 18));
      item.setAllocatedEquipmentCost(number(row, 19));
      item.setAllocatedWorkerCost(number(row, 20));
      item.setAllocatedDriverExpenses(number(row, 21));
      item.setAllocatedOtherCost(number(row, 22));
      item.setOverheadAmount(number(row, 23));
      item.setTotalAllocatedCost(number(row, 24));
    } else if ("PRODUCTION_REGLAGE".equals(module)) {
      item.setLengthValue(number(row, 7));
      item.setWidthValue(number(row, 8));
      item.setHours(first(number(row, 9), number(row, 13)));
      item.setQuantity(first(number(row, 10), CalculationService.calculateProductionQuantity("M2", item.getLengthValue(), item.getWidthValue(), null, null)));
      item.setUnit("M2");
      item.setAllocatedGasoilLiters(number(row, 16));
      item.setAllocatedGasoilAmount(number(row, 17));
      item.setAllocatedEquipmentCost(number(row, 18));
      item.setAllocatedWorkerCost(number(row, 19));
      item.setAllocatedDriverExpenses(number(row, 20));
      item.setAllocatedOtherCost(number(row, 21));
      item.setOverheadAmount(number(row, 22));
      item.setTotalAllocatedCost(number(row, 23));
    } else if ("CANA_TRANCHEE".equals(module)) {
      item.setDiameter(text(row, 6));
      item.setPipeType(text(row, 7));
      item.setSoilType(text(row, 8));
      item.setDepthValue(number(row, 9));
      item.setLengthValue(number(row, 10));
      item.setWidthValue(number(row, 11));
      item.setQuantity(first(number(row, 12), CalculationService.calculateProductionQuantity("M3", item.getLengthValue(), item.getWidthValue(), item.getDepthValue(), null)));
      item.setHours(first(number(row, 13), number(row, 16)));
      item.setUnit("M3");
      item.setTotalAllocatedCost(number(row, 20));
      item.setAllocatedGasoilLiters(number(row, 22));
    } else {
      item.setDiameter(text(row, 6));
      item.setPipeType(text(row, 7));
      item.setPoseType(text(row, 8));
      item.setLengthValue(number(row, 9));
      item.setQuantity(first(number(row, 9), BigDecimal.ZERO));
      item.setHours(first(number(row, 11), number(row, 14)));
      item.setUnit("ML");
      item.setTotalAllocatedCost(number(row, 18));
      item.setAllocatedGasoilLiters(number(row, 20));
    }
    var saved = productions.save(item);
    rememberProductionReferences(saved);
    return new ImportedTarget("ProductionRecord", saved.getId());
  }

  private void rememberProductionReferences(ProductionRecordEntity item) {
    references.getOrCreate(item.getChantierId(), "VOIE", item.getVoie());
    if (item.getTranche() != null && !item.getTranche().isBlank()) references.getOrCreate(item.getChantierId(), "TRANCHE", item.getTranche());
    if (item.getWorkType() != null && !item.getWorkType().isBlank()) references.getOrCreate(item.getChantierId(), "TRAVAIL", item.getWorkType());
    if (item.getDriver() != null && !item.getDriver().isBlank()) references.getOrCreate(item.getChantierId(), "CHAUFFEUR", item.getDriver());
    if (item.getDiameter() != null && !item.getDiameter().isBlank()) references.getOrCreate(item.getChantierId(), "DIAMETRE", item.getDiameter());
    if (item.getPipeType() != null && !item.getPipeType().isBlank()) references.getOrCreate(item.getChantierId(), "TYPE_CANALISATION", item.getPipeType());
    if (item.getSoilType() != null && !item.getSoilType().isBlank()) references.getOrCreate(item.getChantierId(), "NATURE_SOL", item.getSoilType());
    if (item.getPoseType() != null && !item.getPoseType().isBlank()) references.getOrCreate(item.getChantierId(), "NATURE_POSE", item.getPoseType());
  }

  private SupplierEntity supplier(String name, SupplierType type) {
    var supplierName = blank(name, "Fournisseur import Excel");
    return suppliers.findByNameIgnoreCase(supplierName).orElseGet(() -> {
      var item = new SupplierEntity();
      item.setName(supplierName);
      item.setType(type);
      item.setActive(true);
      return suppliers.save(item);
    });
  }

  private List<CoreDtos.ImportIssueDto> rowIssues(Sheet sheet, Row row, String module) {
    var issues = new ArrayList<CoreDtos.ImportIssueDto>();
    for (var cell : row) {
      var value = cellText(cell);
      if (EXCEL_ERRORS.contains(value)) {
        issues.add(issue(sheet, row, issueSeverity(module, cell), "Erreur Excel " + value + " en " + cell.getAddress()));
      }
      if (cell.getCellType() == CellType.FORMULA) {
        var formula = cell.getCellFormula();
        if (formula.contains("#REF!")) {
          issues.add(issue(sheet, row, issueSeverity(module, cell), "Formule cassee #REF! en " + cell.getAddress()));
        }
        if (formula.contains("[") && formula.contains("]")) {
          issues.add(issue(sheet, row, "WARNING", "Lien externe detecte en " + cell.getAddress()));
        }
      }
    }
    if (!"UNKNOWN".equals(module) && date(row, dateColumn(module)) == null) {
      issues.add(issue(sheet, row, "CRITICAL", "Date obligatoire absente ou invalide."));
    }
    if ("GASOIL_ENTRY".equals(module) && positive(number(row, 2)).not()) {
      issues.add(issue(sheet, row, "CRITICAL", "Litres entree gasoil invalides."));
    }
    if ("GASOIL_EXIT".equals(module) && nonZero(number(row, 7)).not()) {
      issues.add(issue(sheet, row, "CRITICAL", "Litres sortie gasoil invalides."));
    }
    if (module.startsWith("PRODUCTION") || module.startsWith("CANA")) {
      var quantity = productionQuantity(module, row);
      if (positive(quantity).not()) {
        issues.add(issue(sheet, row, "WARNING", "Quantite production absente ou nulle."));
      }
    }
    return issues;
  }

  private String issueSeverity(String module, Cell cell) {
    return cell.getColumnIndex() <= importColumnLimit(module) ? "CRITICAL" : "WARNING";
  }

  private int importColumnLimit(String module) {
    return switch (module) {
      case "GASOIL_ENTRY", "GASOIL_EXIT" -> 10;
      case "CAISSE" -> 6;
      case "PRODUCTION_DECAPAGE" -> 24;
      case "PRODUCTION_REGLAGE" -> 23;
      case "CANA_TRANCHEE" -> 22;
      case "CANA_POSE" -> 20;
      default -> Integer.MAX_VALUE;
    };
  }

  private CoreDtos.ImportIssueDto issue(Sheet sheet, Row row, String severity, String message) {
    return new CoreDtos.ImportIssueDto(sheet.getSheetName(), row.getRowNum() + 1, severity, message);
  }

  private void collectMetrics(Map<String, BigDecimal> metrics, String module, Row row) {
    if ("GASOIL_ENTRY".equals(module)) add(metrics, "Gasoil entree", number(row, 2));
    if ("GASOIL_EXIT".equals(module)) add(metrics, "Gasoil sortie", number(row, 7));
    if ("PRODUCTION_DECAPAGE".equals(module)) add(metrics, "Decapage volume", productionQuantity(module, row));
    if ("PRODUCTION_REGLAGE".equals(module)) add(metrics, "Reglage surface", productionQuantity(module, row));
    if ("CANA_TRANCHEE".equals(module)) add(metrics, "CANA tranchees", productionQuantity(module, row));
    if ("CANA_POSE".equals(module)) add(metrics, "CANA pose", productionQuantity(module, row));
    if ("POINTAGE_CANA".equals(module)) add(metrics, "Heures CANA", number(row, 7));
  }

  private BigDecimal productionQuantity(String module, Row row) {
    if ("PRODUCTION_DECAPAGE".equals(module)) return first(number(row, 11), BigDecimal.ZERO);
    if ("PRODUCTION_REGLAGE".equals(module)) return first(number(row, 10), BigDecimal.ZERO);
    if ("CANA_TRANCHEE".equals(module)) return first(number(row, 12), BigDecimal.ZERO);
    if ("CANA_POSE".equals(module)) return first(number(row, 9), BigDecimal.ZERO);
    return BigDecimal.ZERO;
  }

  private void add(Map<String, BigDecimal> metrics, String key, BigDecimal value) {
    if (value != null) {
      metrics.put(key, metrics.getOrDefault(key, BigDecimal.ZERO).add(value));
    }
  }

  private List<String> headers(Sheet sheet, int headerRow) {
    var row = sheet.getRow(headerRow - 1);
    if (row == null) return List.of();
    return rowValues(row, Math.min(row.getLastCellNum(), 60));
  }

  private List<String> rowValues(Row row, int columns) {
    var values = new ArrayList<String>();
    for (int i = 0; i < Math.max(columns, 0); i++) {
      values.add(cellText(row.getCell(i)));
    }
    return values;
  }

  private boolean blankRow(Row row) {
    for (var cell : row) {
      if (!cellText(cell).isBlank()) {
        return false;
      }
    }
    return true;
  }

  private boolean isDataRow(String module, Row row) {
    if ("UNKNOWN".equals(module)) {
      return false;
    }
    if ("POINTAGE_ENGINS_MATRIX".equals(module) || "POINTAGE_PERSONNEL_MATRIX".equals(module)) {
      return row.getRowNum() > headerRow(module) && !text(row, 0).isBlank();
    }
    return date(row, dateColumn(module)) != null;
  }

  private int dateColumn(String module) {
    return "GASOIL_EXIT".equals(module) ? 3 : 0;
  }

  private String detectedKey(String module, Row row) {
    return switch (module) {
      case "GASOIL_ENTRY" -> text(row, 5);
      case "GASOIL_EXIT" -> text(row, 2);
      case "CAISSE" -> text(row, 0) + "|" + text(row, 3);
      default -> text(row, 0) + "|" + text(row, 1) + "|" + text(row, 4);
    };
  }

  private String detectModule(String sheetName) {
    var name = ReferenceService.normalize(sheetName);
    if (name.equals("TRANSACTIONS")) return "CAISSE";
    if (name.equals("GASOIL ENTRE")) return "GASOIL_ENTRY";
    if (name.equals("GASOIL SORTIE")) return "GASOIL_EXIT";
    if (name.equals("SAISIE DECAPAGE")) return "PRODUCTION_DECAPAGE";
    if (name.equals("SAISIE REGLAGE")) return "PRODUCTION_REGLAGE";
    if (name.equals("POINTAGE CANA")) return "POINTAGE_CANA";
    if (name.equals("CANA TRANCHEES")) return "CANA_TRANCHEE";
    if (name.equals("CANA POSE")) return "CANA_POSE";
    if (name.contains("POINTAGE ENGINS")) return "POINTAGE_ENGINS_MATRIX";
    if (name.contains("POINTAGE SALAIRE")) return "POINTAGE_PERSONNEL_MATRIX";
    return "UNKNOWN";
  }

  private int headerRow(String module) {
    return switch (module) {
      case "GASOIL_ENTRY" -> 4;
      case "GASOIL_EXIT" -> 35;
      case "PRODUCTION_DECAPAGE", "PRODUCTION_REGLAGE", "POINTAGE_CANA", "CANA_TRANCHEE", "CANA_POSE" -> 3;
      case "POINTAGE_ENGINS_MATRIX" -> 9;
      case "POINTAGE_PERSONNEL_MATRIX" -> 6;
      default -> 1;
    };
  }

  private ProductionFamily family(String module) {
    return switch (module) {
      case "PRODUCTION_REGLAGE" -> ProductionFamily.REGLAGE;
      case "CANA_TRANCHEE" -> ProductionFamily.CANA_TRANCHEE;
      case "CANA_POSE" -> ProductionFamily.CANA_POSE;
      default -> ProductionFamily.DECAPAGE;
    };
  }

  private String allocation(String affectation) {
    var value = ReferenceService.normalize(affectation);
    if (value.contains("ETP")) return "etp";
    if (value.contains("TRANSPORT") || value.contains("CAMION")) return "transport";
    return "production";
  }

  private String metricUnit(String label) {
    if (label.contains("entree") || label.contains("sortie")) return "L";
    if (label.contains("surface")) return "m2";
    if (label.contains("pose")) return "ml";
    if (label.contains("Heures")) return "h";
    return "m3";
  }

  private String role(String workbookRole) {
    return workbookRole == null || workbookRole.isBlank() ? "AUTO" : workbookRole.toUpperCase(Locale.ROOT);
  }

  private LocalDate date(Row row, int column) {
    var cell = row.getCell(column);
    if (cell == null) return null;
    try {
      if (cell.getCellType() == CellType.NUMERIC && org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
        return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
      }
      var value = cellText(cell);
      if (value.isBlank() || value.contains("/")) {
        var parts = value.split("/");
        if (parts.length == 3) {
          return LocalDate.of(Integer.parseInt(parts[2]), Integer.parseInt(parts[1]), Integer.parseInt(parts[0]));
        }
      }
      if (value.matches("\\d{4}-\\d{2}-\\d{2}.*")) {
        return LocalDate.parse(value.substring(0, 10));
      }
    } catch (RuntimeException ignored) {
      return null;
    }
    return null;
  }

  private BigDecimal number(Row row, int column) {
    var cell = row.getCell(column);
    if (cell == null) return null;
    try {
      if (cell.getCellType() == CellType.NUMERIC || cell.getCellType() == CellType.FORMULA) {
        return BigDecimal.valueOf(cell.getNumericCellValue());
      }
      var value = cellText(cell).replace(" ", "").replace(",", ".");
      if (value.isBlank()) return null;
      return new BigDecimal(value);
    } catch (RuntimeException ignored) {
      return null;
    }
  }

  private String text(Row row, int column) {
    return cellText(row.getCell(column)).trim();
  }

  private String cellText(Cell cell) {
    if (cell == null) return "";
    if (cell.getCellType() == CellType.FORMULA) {
      try {
        return formatter.formatCellValue(cell);
      } catch (RuntimeException ignored) {
        return cell.getCellFormula();
      }
    }
    return formatter.formatCellValue(cell).trim();
  }

  private static BigDecimal first(BigDecimal first, BigDecimal fallback) {
    return first == null ? fallback : first;
  }

  private static String blank(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value;
  }

  private Positive positive(BigDecimal value) {
    return new Positive(value != null && value.compareTo(BigDecimal.ZERO) > 0);
  }

  private Positive nonZero(BigDecimal value) {
    return new Positive(value != null && value.compareTo(BigDecimal.ZERO) != 0);
  }

  private record Positive(boolean ok) {
    boolean not() {
      return !ok;
    }
  }

  private record ImportedTarget(String type, UUID id) {
  }
}

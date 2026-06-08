package ma.omotal.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import ma.omotal.domain.enums.BillingMode;
import ma.omotal.domain.enums.ChantierStatus;
import ma.omotal.domain.enums.DayType;
import ma.omotal.domain.enums.EquipmentStatus;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.PaymentMode;
import ma.omotal.domain.enums.ProductionFamily;
import ma.omotal.domain.enums.RemunerationType;
import ma.omotal.domain.enums.SupplierType;
import ma.omotal.domain.enums.TransactionCategory;
import ma.omotal.domain.enums.TransactionType;
import ma.omotal.domain.enums.DocumentType;

public final class CoreDtos {
  private CoreDtos() {
  }

  public record ChantierDto(
      UUID id,
      String name,
      String code,
      String client,
      String location,
      LocalDate startedAt,
      LocalDate expectedEndAt,
      BigDecimal marketAmountHt,
      ChantierStatus status,
      UUID managerUserId
  ) {
  }

  public record CreateChantierRequest(
      @NotBlank String name,
      @NotBlank String code,
      @NotBlank String client,
      @NotBlank String location,
      @NotNull LocalDate startedAt,
      LocalDate expectedEndAt,
      BigDecimal marketAmountHt,
      UUID managerUserId
  ) {
  }

  public record SupplierDto(UUID id, String name, SupplierType type, String phone, boolean active) {
  }

  public record CreateSupplierRequest(
      @NotBlank String name,
      @NotNull SupplierType type,
      String phone
  ) {
  }

  public record EquipmentDto(
      UUID id,
      String designation,
      String type,
      String owner,
      UUID chantierId,
      BillingMode billingMode,
      BigDecimal hourlyRate,
      BigDecimal dailyRate,
      String usualDriver,
      EquipmentStatus status
  ) {
  }

  public record CreateEquipmentRequest(
      @NotBlank String designation,
      @NotBlank String type,
      @NotBlank String owner,
      @NotNull UUID chantierId,
      @NotNull BillingMode billingMode,
      BigDecimal hourlyRate,
      BigDecimal dailyRate,
      String usualDriver
  ) {
  }

  public record EmployeeDto(
      UUID id,
      String firstName,
      String lastName,
      String position,
      UUID chantierId,
      RemunerationType remunerationType,
      BigDecimal monthlySalary,
      BigDecimal dailySalary,
      BigDecimal hourlySalary,
      boolean active
  ) {
  }

  public record CreateEmployeeRequest(
      @NotBlank String firstName,
      @NotBlank String lastName,
      @NotBlank String position,
      @NotNull UUID chantierId,
      @NotNull RemunerationType remunerationType,
      BigDecimal monthlySalary,
      BigDecimal dailySalary,
      BigDecimal hourlySalary
  ) {
  }

  public record CaisseTransactionDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      TransactionType type,
      BigDecimal amount,
      PaymentMode paymentMode,
      TransactionCategory category,
      String description,
      String personOrSupplier,
      OperationStatus status,
      boolean hasDocument,
      UUID enteredByUserId
  ) {
  }

  public record CreateTransactionRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull TransactionType type,
      @Positive BigDecimal amount,
      @NotNull PaymentMode paymentMode,
      @NotNull TransactionCategory category,
      @NotBlank String description,
      String personOrSupplier,
      boolean submit
  ) {
  }

  public record GasoilEntryDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID supplierId,
      BigDecimal liters,
      BigDecimal unitPrice,
      BigDecimal totalAmount,
      String receiptNumber,
      OperationStatus status,
      boolean hasDocument
  ) {
  }

  public record CreateGasoilEntryRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull UUID supplierId,
      @Positive BigDecimal liters,
      @Positive BigDecimal unitPrice,
      String receiptNumber,
      boolean submit
  ) {
  }

  public record GasoilExitDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID equipmentId,
      String responsible,
      String allocation,
      BigDecimal liters,
      BigDecimal unitPrice,
      BigDecimal totalAmount,
      String exitNumber,
      OperationStatus status,
      boolean hasDocument,
      UUID enteredByUserId
  ) {
  }

  public record CreateGasoilExitRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      UUID equipmentId,
      @NotBlank String responsible,
      @NotBlank String allocation,
      @Positive BigDecimal liters,
      @Positive BigDecimal unitPrice,
      String exitNumber,
      boolean submit
  ) {
  }

  public record PersonnelTimesheetDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID employeeId,
      BigDecimal hoursWorked,
      DayType dayType,
      RemunerationType appliedRemunerationType,
      BigDecimal due,
      OperationStatus status
  ) {
  }

  public record CreatePersonnelTimesheetRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull UUID employeeId,
      @Positive BigDecimal hoursWorked,
      @NotNull DayType dayType,
      boolean submit
  ) {
  }

  public record PersonnelAdvanceDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID employeeId,
      BigDecimal amount,
      UUID transactionId,
      OperationStatus status
  ) {
  }

  public record ProductionRecordDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      ProductionFamily productionFamily,
      String voie,
      String tranche,
      String troncon,
      String workType,
      UUID equipmentId,
      String driver,
      BigDecimal lengthValue,
      BigDecimal widthValue,
      BigDecimal depthValue,
      String diameter,
      String pipeType,
      String soilType,
      String poseType,
      BigDecimal quantity,
      String unit,
      BigDecimal hours,
      BigDecimal rendement,
      BigDecimal allocatedGasoilLiters,
      BigDecimal allocatedGasoilAmount,
      BigDecimal allocatedEquipmentCost,
      BigDecimal allocatedWorkerCost,
      BigDecimal allocatedDriverExpenses,
      BigDecimal allocatedOtherCost,
      BigDecimal overheadAmount,
      BigDecimal totalAllocatedCost,
      BigDecimal costPerUnit,
      OperationStatus status
  ) {
  }

  public record CreateProductionRecordRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      ProductionFamily productionFamily,
      @NotBlank String voie,
      String tranche,
      String troncon,
      @NotBlank String workType,
      UUID equipmentId,
      String driver,
      BigDecimal lengthValue,
      BigDecimal widthValue,
      BigDecimal depthValue,
      BigDecimal quantity,
      @NotBlank String unit,
      BigDecimal hours,
      String diameter,
      String pipeType,
      String soilType,
      String poseType,
      BigDecimal allocatedGasoilLiters,
      BigDecimal allocatedGasoilAmount,
      BigDecimal allocatedEquipmentCost,
      BigDecimal allocatedWorkerCost,
      BigDecimal allocatedDriverExpenses,
      BigDecimal allocatedOtherCost,
      BigDecimal overheadAmount,
      BigDecimal totalAllocatedCost,
      boolean submit
  ) {
  }

  public record ProductionAnalyticsDto(
      UUID chantierId,
      LocalDate from,
      LocalDate to,
      ProductionFamily family,
      BigDecimal totalQuantity,
      BigDecimal totalHours,
      BigDecimal totalGasoilLiters,
      BigDecimal totalCost,
      BigDecimal rendementPerHour,
      BigDecimal costPerUnit,
      List<ProductionBreakdownDto> byFamily,
      List<ProductionBreakdownDto> byVoie,
      List<ProductionBreakdownDto> byEquipment,
      List<ProductionBreakdownDto> byDriver
  ) {
  }

  public record ProductionBreakdownDto(
      String key,
      BigDecimal quantity,
      BigDecimal hours,
      BigDecimal gasoilLiters,
      BigDecimal totalCost,
      BigDecimal rendementPerHour,
      BigDecimal costPerUnit
  ) {
  }

  public record ChantierSettingsDto(
      UUID id,
      UUID chantierId,
      BigDecimal standardHoursPerDay,
      BigDecimal overheadRate,
      BigDecimal defaultVatRate,
      String gasoilPriceStrategy,
      String currency
  ) {
  }

  public record ReferenceValueDto(
      UUID id,
      UUID chantierId,
      String category,
      String value,
      String normalizedValue,
      String aliasOfValue,
      boolean active,
      int sortOrder
  ) {
  }

  public record CreateReferenceValueRequest(
      @NotNull UUID chantierId,
      @NotBlank String category,
      @NotBlank String value,
      String aliasOfValue,
      Integer sortOrder
  ) {
  }

  public record MaterialPurchaseDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID supplierId,
      String designation,
      String unit,
      BigDecimal quantity,
      BigDecimal unitPriceHt,
      BigDecimal transportHt,
      BigDecimal totalHt,
      BigDecimal vatRate,
      BigDecimal totalTtc,
      String receiptNumber,
      String supplierDocumentNumber,
      LocalDate dueDate,
      BigDecimal paidAmount,
      BigDecimal remainingAmount,
      OperationStatus status,
      boolean hasDocument
  ) {
  }

  public record CreateMaterialPurchaseRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull UUID supplierId,
      @NotBlank String designation,
      @NotBlank String unit,
      @Positive BigDecimal quantity,
      @Positive BigDecimal unitPriceHt,
      BigDecimal transportHt,
      BigDecimal vatRate,
      String receiptNumber,
      String supplierDocumentNumber,
      LocalDate dueDate,
      boolean submit
  ) {
  }

  public record SupplierPaymentDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID supplierId,
      BigDecimal amount,
      PaymentMode paymentMode,
      OperationStatus status,
      String note
  ) {
  }

  public record CreateSupplierPaymentRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull UUID supplierId,
      @Positive BigDecimal amount,
      @NotNull PaymentMode paymentMode,
      String note,
      boolean submit
  ) {
  }

  public record EtpPrestationDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID supplierId,
      String designation,
      BigDecimal quantity,
      BigDecimal unitPrice,
      BigDecimal amountHt,
      BigDecimal vatRate,
      BigDecimal amountTtc,
      OperationStatus status
  ) {
  }

  public record CreateEtpPrestationRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull UUID supplierId,
      @NotBlank String designation,
      @Positive BigDecimal quantity,
      @Positive BigDecimal unitPrice,
      BigDecimal vatRate,
      boolean submit
  ) {
  }

  public record EtpImputationDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID supplierId,
      String imputationType,
      BigDecimal amount,
      String note,
      OperationStatus status
  ) {
  }

  public record CreateEtpImputationRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull UUID supplierId,
      @NotBlank String imputationType,
      @Positive BigDecimal amount,
      String note,
      boolean submit
  ) {
  }

  public record EtpOverviewDto(
      List<EtpPrestationDto> prestations,
      List<EtpImputationDto> imputations,
      BigDecimal totalPrestations,
      BigDecimal totalImputations,
      BigDecimal remainingAmount
  ) {
  }

  public record TransportRecordDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID supplierId,
      String designation,
      String departure,
      String arrival,
      BigDecimal trips,
      BigDecimal unitPrice,
      BigDecimal totalAmount,
      String receiptNumber,
      String allocation,
      OperationStatus status,
      boolean hasDocument
  ) {
  }

  public record CreateTransportRecordRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull UUID supplierId,
      @NotBlank String designation,
      String departure,
      String arrival,
      @Positive BigDecimal trips,
      @Positive BigDecimal unitPrice,
      String receiptNumber,
      String allocation,
      boolean submit
  ) {
  }

  public record MaintenanceRecordDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID equipmentId,
      UUID supplierId,
      String interventionType,
      String designation,
      BigDecimal quantity,
      BigDecimal unitPrice,
      BigDecimal totalAmount,
      boolean immobilized,
      BigDecimal downtimeDays,
      OperationStatus status,
      boolean hasDocument
  ) {
  }

  public record CreateMaintenanceRecordRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull UUID equipmentId,
      UUID supplierId,
      @NotBlank String interventionType,
      @NotBlank String designation,
      @Positive BigDecimal quantity,
      @Positive BigDecimal unitPrice,
      boolean immobilized,
      BigDecimal downtimeDays,
      boolean submit
  ) {
  }

  public record BqArticleDto(
      UUID id,
      UUID chantierId,
      String articleNumber,
      String designation,
      String unit,
      BigDecimal marketQuantity,
      BigDecimal marketUnitPriceHt,
      BigDecimal marketAmountHt,
      BigDecimal plannedCostTotal,
      BigDecimal realisedQuantity,
      BigDecimal realisedAmountHt,
      BigDecimal progressRate,
      BigDecimal realMargin,
      boolean active
  ) {
  }

  public record CreateBqArticleRequest(
      @NotNull UUID chantierId,
      @NotBlank String articleNumber,
      @NotBlank String designation,
      @NotBlank String unit,
      @Positive BigDecimal marketQuantity,
      @Positive BigDecimal marketUnitPriceHt,
      BigDecimal plannedCostTotal
  ) {
  }

  public record BqRealisationDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID bqArticleId,
      BigDecimal quantity,
      String source,
      OperationStatus status
  ) {
  }

  public record CreateBqRealisationRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull UUID bqArticleId,
      @Positive BigDecimal quantity,
      @NotBlank String source,
      boolean submit
  ) {
  }

  public record BqOverviewDto(
      List<BqArticleDto> articles,
      List<BqRealisationDto> realisations
  ) {
  }

  public record ImportPreviewDto(
      String fileName,
      String sheetName,
      List<String> headers,
      List<List<String>> sampleRows,
      List<String> errors
  ) {
  }

  public record ImportWorkbookPreviewDto(
      String fileName,
      String workbookRole,
      int sheetCount,
      int totalRows,
      int validRows,
      int warningRows,
      int blockedRows,
      List<ImportSheetPreviewDto> sheets,
      List<String> errors
  ) {
  }

  public record ImportSheetPreviewDto(
      String sheetName,
      String module,
      int headerRow,
      List<String> headers,
      int dataRows,
      int validRows,
      int warningRows,
      int blockedRows,
      List<ImportIssueDto> issues,
      List<ImportMetricDto> metrics,
      List<List<String>> sampleRows
  ) {
  }

  public record ImportMetricDto(String label, BigDecimal value, String unit) {
  }

  public record ImportIssueDto(
      String sheetName,
      int rowNumber,
      String severity,
      String message
  ) {
  }

  public record ImportCommitDto(
      UUID batchId,
      UUID chantierId,
      String fileName,
      String workbookRole,
      String status,
      int totalRows,
      int validRows,
      int warningRows,
      int blockedRows,
      int importedRows
  ) {
  }

  public record ImportBatchDto(
      UUID id,
      UUID chantierId,
      String fileName,
      String workbookRole,
      String status,
      int totalSheets,
      int totalRows,
      int validRows,
      int warningRows,
      int blockedRows
  ) {
  }

  public record ImportRowDto(
      UUID id,
      UUID batchId,
      String sheetName,
      String module,
      int sourceRowNumber,
      String rowStatus,
      String severity,
      String errors,
      String detectedKey,
      String importedTargetType,
      UUID importedTargetId
  ) {
  }

  public record EquipmentTimesheetDto(
      UUID id,
      LocalDate date,
      UUID chantierId,
      UUID equipmentId,
      String driver,
      BigDecimal hoursWorked,
      BigDecimal daysBilled,
      String activityType,
      BillingMode appliedBillingMode,
      BigDecimal cost,
      OperationStatus status
  ) {
  }

  public record CreateEquipmentTimesheetRequest(
      @NotNull LocalDate date,
      @NotNull UUID chantierId,
      @NotNull UUID equipmentId,
      @NotBlank String driver,
      BigDecimal hoursWorked,
      BigDecimal daysBilled,
      @NotBlank String activityType,
      boolean submit
  ) {
  }

  public record AlertDto(String id, String severity, String module, UUID chantierId, String title, String description) {
  }

  public record GasoilOverviewDto(
      List<GasoilEntryDto> entries,
      List<GasoilExitDto> exits,
      BigDecimal inputLiters,
      BigDecimal outputLiters,
      BigDecimal stockLiters
  ) {
  }

  public record DashboardSummaryDto(
      BigDecimal cashBalance,
      BigDecimal cashDebit,
      BigDecimal cashCredit,
      BigDecimal gasoilStockLiters,
      BigDecimal gasoilInputLiters,
      BigDecimal gasoilOutputLiters,
      BigDecimal personnelDue,
      BigDecimal personnelAdvances,
      BigDecimal equipmentCost,
      BigDecimal productionQuantity,
      BigDecimal productionHours,
      BigDecimal productionCost,
      BigDecimal productionRendement,
      BigDecimal productionCostPerUnit,
      int pendingValidations,
      List<AlertDto> alerts
  ) {
  }

  public record ValidationItemDto(
      UUID id,
      String type,
      UUID chantierId,
      LocalDate date,
      String summary,
      String amountOrQuantity,
      OperationStatus status,
      boolean hasDocument
  ) {
  }

  public record RejectRequest(@NotBlank String reason) {
  }

  public record DocumentDto(
      UUID id,
      UUID chantierId,
      DocumentType documentType,
      String fileName,
      String contentType,
      long sizeBytes,
      String module,
      String targetType,
      UUID targetId
  ) {
  }
}

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

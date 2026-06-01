package ma.omotal.api;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.BqArticleEntity;
import ma.omotal.domain.BqRealisationEntity;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.ChantierEntity;
import ma.omotal.domain.DocumentEntity;
import ma.omotal.domain.EmployeeEntity;
import ma.omotal.domain.EquipmentEntity;
import ma.omotal.domain.EquipmentTimesheetEntity;
import ma.omotal.domain.EtpImputationEntity;
import ma.omotal.domain.EtpPrestationEntity;
import ma.omotal.domain.GasoilEntryEntity;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.MaintenanceRecordEntity;
import ma.omotal.domain.MaterialPurchaseEntity;
import ma.omotal.domain.PersonnelAdvanceEntity;
import ma.omotal.domain.PersonnelTimesheetEntity;
import ma.omotal.domain.ProductionRecordEntity;
import ma.omotal.domain.SupplierEntity;
import ma.omotal.domain.SupplierPaymentEntity;
import ma.omotal.domain.TransportRecordEntity;
import ma.omotal.service.CalculationService;

public final class Mapper {
  private Mapper() {
  }

  public static CoreDtos.ChantierDto chantier(ChantierEntity item) {
    return new CoreDtos.ChantierDto(
        item.getId(),
        item.getName(),
        item.getCode(),
        item.getClient(),
        item.getLocation(),
        item.getStartedAt(),
        item.getExpectedEndAt(),
        item.getMarketAmountHt(),
        item.getStatus(),
        item.getManagerUserId()
    );
  }

  public static CoreDtos.SupplierDto supplier(SupplierEntity item) {
    return new CoreDtos.SupplierDto(item.getId(), item.getName(), item.getType(), item.getPhone(), item.isActive());
  }

  public static CoreDtos.DocumentDto document(DocumentEntity item) {
    return new CoreDtos.DocumentDto(
        item.getId(),
        item.getChantierId(),
        item.getDocumentType(),
        item.getFileName(),
        item.getContentType(),
        item.getSizeBytes(),
        item.getModule(),
        item.getTargetType(),
        item.getTargetId()
    );
  }

  public static CoreDtos.EquipmentDto equipment(EquipmentEntity item) {
    return new CoreDtos.EquipmentDto(
        item.getId(),
        item.getDesignation(),
        item.getType(),
        item.getOwner(),
        item.getChantierId(),
        item.getBillingMode(),
        item.getHourlyRate(),
        item.getDailyRate(),
        item.getUsualDriver(),
        item.getStatus()
    );
  }

  public static CoreDtos.EmployeeDto employee(EmployeeEntity item) {
    return new CoreDtos.EmployeeDto(
        item.getId(),
        item.getFirstName(),
        item.getLastName(),
        item.getPosition(),
        item.getChantierId(),
        item.getRemunerationType(),
        item.getMonthlySalary(),
        item.getDailySalary(),
        item.getHourlySalary(),
        item.isActive()
    );
  }

  public static CoreDtos.CaisseTransactionDto transaction(CaisseTransactionEntity item) {
    return new CoreDtos.CaisseTransactionDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getType(),
        item.getAmount(),
        item.getPaymentMode(),
        item.getCategory(),
        item.getDescription(),
        item.getPersonOrSupplier(),
        item.getStatus(),
        item.isHasDocument(),
        item.getEnteredByUserId()
    );
  }

  public static CoreDtos.GasoilEntryDto gasoilEntry(GasoilEntryEntity item) {
    return new CoreDtos.GasoilEntryDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getSupplierId(),
        item.getLiters(),
        item.getUnitPrice(),
        item.getLiters().multiply(item.getUnitPrice()),
        item.getReceiptNumber(),
        item.getStatus(),
        item.isHasDocument()
    );
  }

  public static CoreDtos.GasoilExitDto gasoilExit(GasoilExitEntity item) {
    return new CoreDtos.GasoilExitDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getEquipmentId(),
        item.getResponsible(),
        item.getAllocation(),
        item.getLiters(),
        item.getUnitPrice(),
        item.getLiters().multiply(item.getUnitPrice()),
        item.getExitNumber(),
        item.getStatus(),
        item.isHasDocument(),
        item.getEnteredByUserId()
    );
  }

  public static CoreDtos.PersonnelTimesheetDto personnelTimesheet(PersonnelTimesheetEntity item) {
    return new CoreDtos.PersonnelTimesheetDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getEmployeeId(),
        item.getHoursWorked(),
        item.getDayType(),
        item.getAppliedRemunerationType(),
        CalculationService.calculatePersonnelDue(item),
        item.getStatus()
    );
  }

  public static CoreDtos.PersonnelAdvanceDto personnelAdvance(PersonnelAdvanceEntity item) {
    return new CoreDtos.PersonnelAdvanceDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getEmployeeId(),
        item.getAmount(),
        item.getTransactionId(),
        item.getStatus()
    );
  }

  public static CoreDtos.ProductionRecordDto production(ProductionRecordEntity item) {
    return new CoreDtos.ProductionRecordDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getVoie(),
        item.getTranche(),
        item.getTroncon(),
        item.getWorkType(),
        item.getEquipmentId(),
        item.getDriver(),
        item.getLengthValue(),
        item.getWidthValue(),
        item.getDepthValue(),
        item.getQuantity(),
        item.getUnit(),
        item.getHours(),
        ratio(item.getQuantity(), item.getHours()),
        item.getStatus()
    );
  }

  public static CoreDtos.MaterialPurchaseDto materialPurchase(MaterialPurchaseEntity item) {
    return new CoreDtos.MaterialPurchaseDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getSupplierId(),
        item.getDesignation(),
        item.getUnit(),
        item.getQuantity(),
        item.getUnitPriceHt(),
        item.getTransportHt(),
        item.getTotalHt(),
        item.getVatRate(),
        item.getTotalTtc(),
        item.getReceiptNumber(),
        item.getSupplierDocumentNumber(),
        item.getDueDate(),
        item.getPaidAmount(),
        nvl(item.getTotalTtc()).subtract(nvl(item.getPaidAmount())),
        item.getStatus(),
        item.isHasDocument()
    );
  }

  public static CoreDtos.SupplierPaymentDto supplierPayment(SupplierPaymentEntity item) {
    return new CoreDtos.SupplierPaymentDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getSupplierId(),
        item.getAmount(),
        item.getPaymentMode(),
        item.getStatus(),
        item.getNote()
    );
  }

  public static CoreDtos.EtpPrestationDto etpPrestation(EtpPrestationEntity item) {
    return new CoreDtos.EtpPrestationDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getSupplierId(),
        item.getDesignation(),
        item.getQuantity(),
        item.getUnitPrice(),
        item.getAmountHt(),
        item.getVatRate(),
        item.getAmountTtc(),
        item.getStatus()
    );
  }

  public static CoreDtos.EtpImputationDto etpImputation(EtpImputationEntity item) {
    return new CoreDtos.EtpImputationDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getSupplierId(),
        item.getImputationType(),
        item.getAmount(),
        item.getNote(),
        item.getStatus()
    );
  }

  public static CoreDtos.TransportRecordDto transport(TransportRecordEntity item) {
    return new CoreDtos.TransportRecordDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getSupplierId(),
        item.getDesignation(),
        item.getDeparture(),
        item.getArrival(),
        item.getTrips(),
        item.getUnitPrice(),
        item.getTotalAmount(),
        item.getReceiptNumber(),
        item.getAllocation(),
        item.getStatus(),
        item.isHasDocument()
    );
  }

  public static CoreDtos.MaintenanceRecordDto maintenance(MaintenanceRecordEntity item) {
    return new CoreDtos.MaintenanceRecordDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getEquipmentId(),
        item.getSupplierId(),
        item.getInterventionType(),
        item.getDesignation(),
        item.getQuantity(),
        item.getUnitPrice(),
        item.getTotalAmount(),
        item.isImmobilized(),
        item.getDowntimeDays(),
        item.getStatus(),
        item.isHasDocument()
    );
  }

  public static CoreDtos.BqArticleDto bqArticle(BqArticleEntity item, BigDecimal realisedQuantity) {
    var marketAmount = nvl(item.getMarketQuantity()).multiply(nvl(item.getMarketUnitPriceHt()));
    var realisedAmount = nvl(realisedQuantity).multiply(nvl(item.getMarketUnitPriceHt()));
    return new CoreDtos.BqArticleDto(
        item.getId(),
        item.getChantierId(),
        item.getArticleNumber(),
        item.getDesignation(),
        item.getUnit(),
        item.getMarketQuantity(),
        item.getMarketUnitPriceHt(),
        marketAmount,
        item.getPlannedCostTotal(),
        nvl(realisedQuantity),
        realisedAmount,
        ratio(nvl(realisedQuantity).multiply(new BigDecimal("100")), item.getMarketQuantity()),
        realisedAmount.subtract(nvl(item.getPlannedCostTotal())),
        item.isActive()
    );
  }

  public static CoreDtos.BqRealisationDto bqRealisation(BqRealisationEntity item) {
    return new CoreDtos.BqRealisationDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getBqArticleId(),
        item.getQuantity(),
        item.getSource(),
        item.getStatus()
    );
  }

  public static CoreDtos.EquipmentTimesheetDto equipmentTimesheet(EquipmentTimesheetEntity item) {
    return new CoreDtos.EquipmentTimesheetDto(
        item.getId(),
        item.getDate(),
        item.getChantierId(),
        item.getEquipmentId(),
        item.getDriver(),
        item.getHoursWorked(),
        item.getDaysBilled(),
        item.getActivityType(),
        item.getAppliedBillingMode(),
        CalculationService.calculateEquipmentCost(item),
        item.getStatus()
    );
  }

  public static String formatDh(BigDecimal amount) {
    return amount.stripTrailingZeros().toPlainString() + " DH";
  }

  private static BigDecimal ratio(BigDecimal value, BigDecimal divisor) {
    if (value == null || divisor == null || divisor.compareTo(BigDecimal.ZERO) == 0) {
      return BigDecimal.ZERO;
    }
    return value.divide(divisor, MathContext.DECIMAL64).setScale(2, RoundingMode.HALF_UP);
  }

  private static BigDecimal nvl(BigDecimal value) {
    return value == null ? BigDecimal.ZERO : value;
  }
}

package ma.omotal.api;

import java.math.BigDecimal;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.ChantierEntity;
import ma.omotal.domain.DocumentEntity;
import ma.omotal.domain.EmployeeEntity;
import ma.omotal.domain.EquipmentEntity;
import ma.omotal.domain.EquipmentTimesheetEntity;
import ma.omotal.domain.GasoilEntryEntity;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.PersonnelAdvanceEntity;
import ma.omotal.domain.PersonnelTimesheetEntity;
import ma.omotal.domain.SupplierEntity;
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
}
